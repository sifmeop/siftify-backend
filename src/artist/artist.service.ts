import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Artist, User } from '@prisma/client'
import * as fs from 'fs'
import { join } from 'path'
import { getArtistsPath } from 'src/common/libs/getArtistsPath'
import { PrismaService } from 'src/prisma/prisma.service'
import { IUploadCover } from 'src/types/upload.interface'
import { CreateArtistDto } from './dto'

@Injectable()
export class ArtistService {
  constructor(private prisma: PrismaService) {}

  private createFileCover = (path: string, file: IUploadCover) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    fs.renameSync(file.cover[0].path, join(path, file.cover[0].filename))
  }

  async getArtist(id: string) {
    return this.prisma.artist.findFirst({
      where: { id },
      include: { albums: true }
    })
  }

  async getAllArtists(): Promise<Artist[]> {
    return await this.prisma.artist.findMany()
  }

  async createArtist(
    body: CreateArtistDto,
    file: IUploadCover,
    userId: string
  ): Promise<User> {
    const findArtist = await this.prisma.artist.findFirst({
      where: {
        name: body.name
      }
    })

    if (findArtist) {
      throw new HttpException('Artist already exists', HttpStatus.CONFLICT)
    }

    const artistFolderPath = getArtistsPath(body.name)

    this.createFileCover(`${process.cwd()}/public${artistFolderPath}`, file)

    await this.prisma.artist.create({
      data: {
        userId,
        name: body.name,
        artistPhoto: `${artistFolderPath}/${file.cover[0].filename}`
      }
    })

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'ARTIST'
      },
      include: {
        artist: true
      }
    })
  }
}
