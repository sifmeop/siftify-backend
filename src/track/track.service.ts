import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { FavoriteTrackDto } from 'src/types/track.interface'

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async getAllTracks() {
    const userId = '65477d0a2a5f42e9ad181a5b'
    return this.prisma.track
      .findMany({
        include: {
          favoriteBy: true,
          Artist: {
            select: {
              name: true,
              artistPhoto: true
            }
          }
        }
      })
      .then((tracks) =>
        tracks.map((track) => {
          const artist = track.Artist
          delete track.Artist
          const favoriteBy = track.favoriteBy.find(
            (fav) => fav.userId === userId
          )
          return {
            ...track,
            artist,
            favoriteBy: favoriteBy ?? null
          }
        })
      )
  }

  async addTrackToFavorites(favTrackDto: FavoriteTrackDto) {
    const { userId = '65477d0a2a5f42e9ad181a5b', trackId } = favTrackDto

    return this.prisma.favoriteTrack.create({
      data: { userId, trackId }
    })
  }

  async removeTrackFromFavorites(id: string) {
    return this.prisma.favoriteTrack.delete({
      where: { id }
    })
  }
}
