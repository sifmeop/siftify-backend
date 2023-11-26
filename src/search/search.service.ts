import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(value: string) {
    const tracks = await this.prisma.track.findMany({
      where: {
        title: {
          contains: value,
          mode: 'insensitive'
        }
      }
    })
    const artists = await this.prisma.artist.findMany({
      where: {
        name: {
          contains: value,
          mode: 'insensitive'
        }
      }
    })

    return [...tracks, ...artists]
  }
}
