import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async getAllTracks(userId: string) {
    const allArtists = await this.prisma.artist.findMany()

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

  async getTrack(id: string) {
    return this.prisma.track.findFirst({
      where: { id }
    })
  }

  async listeningTrack(id: string) {
    return this.prisma.track.update({
      data: {
        listening: {
          increment: 1
        }
      },
      where: {
        id
      }
    })
  }

  async addTrackToFavorites(userId: string, trackId: string) {
    return this.prisma.favoriteTrack.create({
      data: { userId, trackId }
    })
  }

  async removeTrackFromFavorites(trackId: string) {
    return this.prisma.favoriteTrack.deleteMany({
      where: { trackId }
    })
  }
}
