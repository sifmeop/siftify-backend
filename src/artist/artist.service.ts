import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Artist, User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateArtistDto } from './dto'

@Injectable()
export class ArtistService {
  constructor(private prisma: PrismaService) {}

  async getArtist(id: string) {
    return this.prisma.artist.findFirst({
      where: { id },
      include: { albums: true }
    })
  }

  async getAllArtists(): Promise<Artist[]> {
    return await this.prisma.artist.findMany()
  }

  async createArtist(body: CreateArtistDto, userId: string): Promise<User> {
    const findArtist = await this.prisma.artist.findFirst({
      where: {
        name: body.name
      }
    })

    if (findArtist) {
      throw new HttpException('Artist already exists', HttpStatus.CONFLICT)
    }

    const artist = await this.prisma.artist.create({
      data: {
        name: body.name,
        userId
      }
    })

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'ARTIST',
        artistId: artist.id
      }
    })
  }
}
