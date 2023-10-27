import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as fs from 'fs'
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

  async uploadTrack(files: Upload, artistDto: UploadArtistDto) {
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
      artistDto.artistName.toLowerCase().replace(' ', '-')
    )

    const dbPath = `/artists/${artistDto.artistName
      .toLowerCase()
      .replace(' ', '-')}`

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
          track: `${dbPath}/${files.audio[0].filename}`
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
        track: `${dbPath}/${files.audio[0].filename}`
      }
    })

    this.createFiles(artistFolderPath, files)

    return { message: 'Files uploaded successfully' }
  }
}
