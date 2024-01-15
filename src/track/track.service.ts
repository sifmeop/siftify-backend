import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async getAllTracks(userId: string) {
    return this.prisma.track
      .findMany({
        where: {
          trackStatus: {
            status: 'UPLOADED'
          }
        },
        include: {
          favoriteBy: true,
          artist: {
            select: {
              name: true,
              artistPhoto: true
            }
          },
          album: {
            select: {
              id: true,
              title: true
            }
          },
          featuring: {
            select: {
              artistId: true,
              artist: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
      .then((tracks) =>
        tracks.map((track) => {
          const artist = track.artist
          delete track.artist
          const favoriteBy =
            track.favoriteBy.find((fav) => fav.userId === userId) ?? null
          const featuring = track.featuring.map((feat) => ({
            artistId: feat.artistId,
            name: feat.artist.name
          }))
          return {
            ...track,
            artist,
            favoriteBy,
            featuring
          }
        })
      )
  }

  async getTrack(id: string) {
    return this.prisma.track.findFirst({
      where: { id },
      include: {
        artist: {
          select: {
            name: true,
            artistPhoto: true
          }
        }
      }
    })
  }

  async listeningTrack(id: string) {
    const track = await this.prisma.track.findFirst({
      where: { id }
    })

    if (!track) {
      throw new Error('Track not found')
    }

    await this.prisma.artist.update({
      data: {
        listening: {
          increment: 1
        }
      },
      where: {
        id: track.artistId
      }
    })

    await this.prisma.track.update({
      data: {
        listening: {
          increment: 1
        }
      },
      where: {
        id
      }
    })

    return { code: HttpStatus.OK, message: 'Track successfully listened' }
  }

  async addTrackToFavorites(userId: string, trackId: string) {
    const isFavorite = await this.prisma.favoriteTrack.findFirst({
      where: {
        userId,
        trackId
      }
    })

    if (isFavorite) {
      throw new HttpException('Track already in favorites', HttpStatus.CONFLICT)
    }

    return this.prisma.favoriteTrack.create({
      data: { userId, trackId }
    })
  }

  async removeTrackFromFavorites(userId: string, trackId: string) {
    const isFavorite = await this.prisma.favoriteTrack.findFirst({
      where: {
        userId,
        trackId
      }
    })

    if (!isFavorite) {
      throw new HttpException('Track not in favorites', HttpStatus.NOT_FOUND)
    }

    return this.prisma.favoriteTrack.deleteMany({
      where: { trackId }
    })
  }
}
