import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { FavoriteTrackDto } from 'src/types/track.interface'

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async getAllTracks(userId: string) {
    const allArtists = await this.prisma.artist.findMany()

    console.debug(allArtists, 'allArtists')

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
          const favoriteBy =
            track.favoriteBy.find((fav) => fav.userId === userId) ?? null
          const featuring = allArtists.filter((artist) =>
            track.featuring.includes(artist.name)
          )
          return {
            ...track,
            artist,
            featuring,
            favoriteBy
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
