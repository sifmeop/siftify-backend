import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Playlist } from '@prisma/client'
import * as fs from 'fs'
import { join } from 'path'
import { PrismaService } from 'src/prisma/prisma.service'
import { IEditPlaylist, IEditPlaylistFile } from 'src/types/playlist.interface'

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  private createFileCover = (path: string, file: IEditPlaylistFile) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    fs.renameSync(file.cover[0].path, join(path, file.cover[0].filename))
  }

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

  async editPlaylist(
    userId: string,
    body: IEditPlaylist,
    file: IEditPlaylistFile
  ): Promise<Playlist> {
    const coverFolderPath = `/playlists/${userId}`

    if (file.cover) {
      this.createFileCover(`${process.cwd()}/public${coverFolderPath}`, file)
    }

    const updateData: Record<string, string> = {
      title: body.title
    }

    if (body.description) {
      updateData.description = body.description
    }

    if (file.cover) {
      updateData.cover = `${coverFolderPath}/${file.cover.filename}`
    }

    return await this.prisma.playlist.update({
      where: {
        id: body.id,
        userId
      },
      data: updateData
    })
  }
}
