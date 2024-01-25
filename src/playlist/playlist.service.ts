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
    return this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      },
      include: {
        tracks: {
          include: {
            featuring: {
              select: {
                artistId: true,
                artist: {
                  select: {
                    name: true
                  }
                }
              }
            },
            favoriteBy: true
          }
        }
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
}
