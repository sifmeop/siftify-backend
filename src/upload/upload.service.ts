import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Artist, Track } from '@prisma/client'
import * as fs from 'fs'
import { parseFile } from 'music-metadata'
import { join } from 'path'
import { generateEmail } from 'src/common/libs/generateEmail'
import { generatePassword } from 'src/common/libs/generatePassword'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  ParsedUploadDtoWithFeat,
  ParsedUploadDtoWithoutFeat,
  Upload,
  UploadDtoBody,
  UploadDtoWithFeat,
  UploadFeaturing
} from 'src/types/upload.interface'

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  private createFiles = (path: string, files: Upload) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }
    console.log('tracksFiles')
    console.dir(files.tracksFiles, { depth: null })
    files.tracksFiles.forEach((file) => {
      fs.renameSync(file.path, join(path, file.filename))
    })

    fs.renameSync(files.cover[0].path, join(path, files.cover[0].filename))
  }

  // private deleteFiles = async (files: Upload) => {
  //   const audioFilePath = `${files.audio[0].destination}/${files.audio[0].filename}`
  //   const coverFilePath = `${files.cover[0].destination}/${files.cover[0].filename}`

  //   try {
  //     await Promise.all([
  //       new Promise<void>((resolve, reject) => {
  //         fs.unlink(audioFilePath, (err) => {
  //           if (err) {
  //             reject(err)
  //           } else {
  //             resolve()
  //           }
  //         })
  //       }),
  //       new Promise<void>((resolve, reject) => {
  //         fs.unlink(coverFilePath, (err) => {
  //           if (err) {
  //             reject(err)
  //           } else {
  //             resolve()
  //           }
  //         })
  //       })
  //     ])
  //   } catch (err) {
  //     console.error('Ошибка при удалении файлов:', err)
  //   }
  // }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
  }

  private findNewArtists(data: ParsedUploadDtoWithFeat[]): string[] {
    let featuring = data.flatMap((item) => item.featuring)
    featuring = featuring.filter((artist) => artist.isNew)

    const newArtists = new Set<string>()
    for (const { label } of featuring) {
      if (!newArtists.has(label)) {
        newArtists.add(label)
      }
    }

    return Array.from(newArtists)
  }

  async uploadTrack(userId: string, files: Upload, artistDto: UploadDtoBody) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      },
      include: {
        artist: true
      }
    })

    const parsedResponse = JSON.parse(
      artistDto.tracksData
    ) as ParsedUploadDtoWithoutFeat[]

    const parsedDto = parsedResponse.map((item) => {
      const featuring = JSON.parse(item.featuring)
      return {
        ...item,
        featuring
      }
    }) as ParsedUploadDtoWithFeat[]

    const isDuplicateTitle = await Promise.all(
      parsedDto.map(async (track) => {
        return await this.prisma.track.findFirst({
          where: {
            artistId: user.artist.id,
            title: track.title
          }
        })
      })
    )

    const filterDuplicateTitle = isDuplicateTitle.filter(
      (item) => item !== null
    )

    if (filterDuplicateTitle.length > 0) {
      const titles = filterDuplicateTitle.map((item) => item.title).join(', ')
      throw new HttpException(
        'There is already such a tracks: ' + titles,
        HttpStatus.CONFLICT
      )
    }

    const findNewArtists = this.findNewArtists(parsedDto)

    const getListNewArtists = await Promise.all(
      findNewArtists.map(async (name) => {
        const artist = await this.prisma.artist.findFirst({
          where: { name }
        })
        return artist ? null : name
      })
    )

    const getNewArtists = getListNewArtists.filter((artist) => !!artist)

    if (getNewArtists.length > 0) {
      let lastUid = 100000

      const lastUser = await this.prisma.user.aggregate({
        _max: {
          uId: true
        }
      })

      lastUid = lastUser._max.uId

      await Promise.all(
        getNewArtists.map(async (name, index) => {
          const uId = lastUid + index + 1
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

          const artist = await this.prisma.artist.create({
            data: {
              userId: user.id,
              name: user.username
            }
          })

          return artist
        })
      )
    }

    const artistNames = parsedDto
      .flatMap((item) => item.featuring)
      .map((artist) => artist.label)

    const featuring = await this.prisma.artist.findMany({
      where: {
        name: {
          in: artistNames
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const artistFolderPath = `/artists/${user.artist.name
      .toLowerCase()
      .replace('.', '')
      .replace(' ', '-')}`

    const getUpdateUploadTrackList: any = await Promise.all(
      parsedDto.map(async (data, index) => {
        const newFeaturing = data.featuring.map((artist) => {
          const findArtist = featuring.find(
            (item) => item.name === artist.label
          )!.id

          return {
            artistId: findArtist
          }
        })

        const duration = await parseFile(
          `${files.tracksFiles[0].destination}/${files.tracksFiles[0].filename}`
        ).then((res) => this.formatDuration(res.format.duration))

        return {
          artistId: user.artist.id,
          title: data.title,
          cover: `${artistFolderPath}/${files.cover[0].filename}`,
          track: `${artistFolderPath}/${files.tracksFiles[index].filename}`,
          featuring: {
            createMany: {
              data: newFeaturing
            }
          },
          duration,
          trackStatus: {
            create: {
              status: 'PENDING',
              artistId: user.artist.id
            }
          }
        }
      })
    )

    await this.prisma.album.create({
      data: {
        artistId: user.artist.id,
        title: artistDto.albumName ?? parsedDto[0].title,
        cover: `${artistFolderPath}/${files.cover[0].filename}`,
        tracks: {
          create: await getUpdateUploadTrackList
        }
      }
    })

    const createArtistFolderPath = join(
      process.cwd(),
      'public/artists',
      user.artist.name.toLowerCase().replace('.', '').replace(' ', '-')
    )

    this.createFiles(createArtistFolderPath, files)

    return { message: 'Files uploaded successfully' }
  }
}
