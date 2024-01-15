import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AlbumService {
  constructor(private prisma: PrismaService) {}

  async getAlbumById(id: string) {
    return await this.prisma.album.findUnique({
      where: {
        id
      },
      include: {
        tracks: true,
        artist: {
          select: {
            name: true,
            artistPhoto: true
          }
        }
      }
    })
  }
}
