import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ArtistService {
  constructor(private prisma: PrismaService) {}

  async getArtist(id: string) {
    return this.prisma.artist.findFirst({
      where: { id },
      include: { Album: true }
    })
  }
}
