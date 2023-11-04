import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async getAllTracks() {
    return this.prisma.track
      .findMany({
        include: {
          Artist: {
            select: {
              name: true,
              photo: true
            }
          }
        }
      })
      .then((tracks) =>
        tracks.map((track) => {
          const artist = track.Artist
          delete track.Artist
          return {
            ...track,
            artist
          }
        })
      )
  }
}
