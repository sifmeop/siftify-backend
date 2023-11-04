import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { parseFile } from 'music-metadata'
import { join } from 'path'
import { PrismaService } from 'src/prisma/prisma.service'
import { Upload, UploadArtistDto } from 'src/types/upload.interface'

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  private createFiles = (path: string, files: Upload) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    fs.renameSync(files.poster[0].path, join(path, files.poster[0].filename))
    fs.renameSync(files.audio[0].path, join(path, files.audio[0].filename))
  }

  private deleteFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
  }

  async uploadTrack(files: Upload, artistDto: UploadArtistDto) {
    console.debug(files, 'files')
    const isDuplicateTitle = await this.prisma.artist.findFirst({
      where: {
        tracks: {
          some: {
            title: artistDto.trackTitle
          }
        }
      }
    })

    if (isDuplicateTitle) {
      const audioFilePath = `${files.audio[0].destination}/${files.audio[0].filename}`
      const posterFilePath = `${files.poster[0].destination}/${files.poster[0].filename}`

      try {
        await Promise.all([
          this.deleteFile(audioFilePath),
          this.deleteFile(posterFilePath)
        ])
        console.log('Файлы успешно удалены')
      } catch (err) {
        console.error('Ошибка при удалении файлов:', err)
      }

      throw new HttpException(
        'There is already such a track',
        HttpStatus.CONFLICT
      )
    }

    const isHasArtist = await this.prisma.artist.findFirst({
      where: { name: artistDto.artistName }
    })

    const artistFolderPath = join(
      process.cwd(),
      'public/artists',
      artistDto.artistName.toLowerCase().replace('.', '').replace(' ', '-')
    )

    const dbPath = `/artists/${artistDto.artistName
      .toLowerCase()
      .replace('.', '')
      .replace(' ', '-')}`

    const featuring = JSON.parse(artistDto.featuring)

    const duration = await parseFile(
      `${files.audio[0].destination}/${files.audio[0].filename}`
    ).then((res) => this.formatDuration(res.format.duration))

    if (!isHasArtist) {
      const artist = await this.prisma.artist.create({
        data: {
          name: artistDto.artistName
        }
      })

      const track = await this.prisma.track.create({
        data: {
          artistId: artist.id,
          title: artistDto.trackTitle,
          poster: `${dbPath}/${files.poster[0].filename}`,
          track: `${dbPath}/${files.audio[0].filename}`,
          featuring,
          duration
        }
      })

      this.createFiles(artistFolderPath, files)

      return { message: 'Files uploaded successfully' }
    }

    const track = await this.prisma.track.create({
      data: {
        artistId: isHasArtist.id,
        title: artistDto.trackTitle,
        poster: `${dbPath}/${files.poster[0].filename}`,
        track: `${dbPath}/${files.audio[0].filename}`,
        featuring,
        duration
      }
    })

    this.createFiles(artistFolderPath, files)

    return { message: 'Files uploaded successfully' }
  }
}
