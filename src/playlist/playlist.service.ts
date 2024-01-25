import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  async getAllPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: {
        userId
      }
    })
  }

  async getPlaylistById(userId: string, playlistId: string) {
    return this.prisma.playlist
      .findFirst({
        where: {
          id: playlistId,
          userId
        },
        include: {
          tracks: {
            include: {
              favoriteBy: {
                select: {
                  userId: true
                }
              },
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
          },
          user: {
            select: {
              username: true
            }
          }
        }
      })
      .then((playlist) => {
        const tracks = playlist.tracks.map((data) => {
          const artist = data.artist
          delete data.artist
          const featuring = data.featuring.map((feat) => ({
            artistId: feat.artistId,
            name: feat.artist.name
          }))
          return {
            ...data,
            artist,
            featuring
          }
        })
        return {
          ...playlist,
          tracks
        }
      })
  }

  async createPlaylist(userId: string) {
    const countPlaylists = await this.prisma.playlist.count({
      where: {
        userId,
        isFavorite: false
      }
    })

    return await this.prisma.playlist.create({
      data: {
        userId,
        title: `Мой плейлист № ${countPlaylists + 1}`
      }
    })
  }

  async deletePlaylist(userId: string, playlistId: string) {
    const isFavoritePlaylist = await this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      },
      select: {
        isFavorite: true
      }
    })

    if (isFavoritePlaylist.isFavorite) {
      throw new HttpException(
        'Can not delete favorite playlist',
        HttpStatus.FORBIDDEN
      )
    }

    await this.prisma.playlist.delete({
      where: {
        id: playlistId,
        userId
      }
    })

    return {
      success: true
    }
  }

  async togglePinPlaylist(
    userId: string,
    body: { playlistId: string; isFixed: boolean }
  ) {
    return await this.prisma.playlist.update({
      where: {
        id: body.playlistId,
        userId
      },
      data: {
        isFixed: body.isFixed,
        isFixedAt: body.isFixed ? new Date() : null
      }
    })
  }

  async addTrackToPlaylist(body: { playlistId: string; trackId: string }) {
    return await this.prisma.track.update({
      where: {
        id: body.trackId
      },
      data: {
        playlist: {
          connect: {
            id: body.playlistId
          }
        }
      }
    })
  }

  async removeTrackFromPlaylist(body: { playlistId: string; trackId: string }) {
    return await this.prisma.track.update({
      where: {
        id: body.trackId,
        playlistId: body.playlistId
      },
      data: {
        playlist: {
          disconnect: true
        }
      }
    })
  }
}
