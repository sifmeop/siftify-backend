import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { parseFile } from 'music-metadata'
import { join } from 'path'
import { generateEmail } from 'src/common/libs/generateEmail'
import { generatePassword } from 'src/common/libs/generatePassword'
import { PrismaService } from 'src/prisma/prisma.service'
import { Upload, UploadArtistDto } from 'src/types/upload.interface'

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  private createFiles = (path: string, files: Upload) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    fs.renameSync(files.cover[0].path, join(path, files.cover[0].filename))
    fs.renameSync(files.audio[0].path, join(path, files.audio[0].filename))
  }

  private deleteFiles = async (files: Upload) => {
    const audioFilePath = `${files.audio[0].destination}/${files.audio[0].filename}`
    const coverFilePath = `${files.cover[0].destination}/${files.cover[0].filename}`

    try {
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          fs.unlink(audioFilePath, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        }),
        new Promise<void>((resolve, reject) => {
          fs.unlink(coverFilePath, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      ])
    } catch (err) {
      console.error('Ошибка при удалении файлов:', err)
    }
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
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
      this.deleteFiles(files)

      throw new HttpException(
        'There is already such a track',
        HttpStatus.CONFLICT
      )
    }

    const parsedFeaturing = JSON.parse(artistDto.featuring) as string[]

    const artistName = parsedFeaturing[0]

    const featuring = await this.prisma.artist.findMany({
      where: {
        name: {
          in: parsedFeaturing.map((name) => name)
        }
      }
    })

    const createArtist = parsedFeaturing.filter(
      (artist) => !featuring.some((featArtist) => artist === featArtist.name)
    )

    if (createArtist.length) {
      try {
        let uId = 100000

        const lastUser = await this.prisma.user.aggregate({
          _max: {
            uId: true
          }
        })

        uId = lastUser._max.uId

        const createdUser = await Promise.all(
          createArtist.map(async (name) => {
            uId += 1
            const { password, hashedPassword } = await generatePassword()
            const user = await this.prisma.user.create({
              data: {
                uId,
                email: generateEmail(name),
                username: name,
                password: hashedPassword,
                role: 'ARTIST'
              }
            })

            await this.prisma.userPlainPassword.create({
              data: {
                userId: user.id,
                password
              }
            })

            return user
          })
        )
        await this.prisma.artist.createMany({
          data: createdUser.map(({ username, id }) => ({
            name: username,
            userId: id
          }))
        })
      } catch (error) {
        console.error('Error creating artists', error)
        throw new HttpException(
          'Error creating artists',
          HttpStatus.BAD_REQUEST
        )
      }
    }

    const artistFolderPath = join(
      process.cwd(),
      'public/artists',
      artistName.toLowerCase().replace('.', '').replace(' ', '-')
    )

    const dbPath = `/artists/${artistName
      .toLowerCase()
      .replace('.', '')
      .replace(' ', '-')}`

    const duration = await parseFile(
      `${files.audio[0].destination}/${files.audio[0].filename}`
    ).then((res) => this.formatDuration(res.format.duration))

    const mainArtistId = await this.prisma.artist
      .findFirst({
        where: { name: artistName }
      })
      .then((res) => res.id)

    const artistCreated = await this.prisma.artist.findMany({
      where: {
        name: {
          in: parsedFeaturing.map((name) => name)
        }
      }
    })

    await this.prisma.track.create({
      data: {
        artistId: mainArtistId,
        title: artistDto.trackTitle,
        cover: `${dbPath}/${files.cover[0].filename}`,
        track: `${dbPath}/${files.audio[0].filename}`,
        featuring: {
          createMany: {
            data: artistCreated.map((featArtist) => ({
              artistId: featArtist.id
            }))
          }
        },
        duration,
        trackStatus: {
          create: {
            status: 'PENDING',
            artistId: mainArtistId
          }
        }
      }
    })

    this.createFiles(artistFolderPath, files)

    return { message: 'Files uploaded successfully' }
  }
}
