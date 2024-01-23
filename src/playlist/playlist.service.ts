import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  async getAllPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        title: true,
        isFixed: true
      }
    })
  }

  async getPlaylistById(userId: string, playlistId: string) {
    return this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId
      },
      select: {
        id: true,
        title: true,
        isFixed: true
      }
    })
  }

  async createPlaylist(userId: string) {
    const countPlaylists = await this.prisma.playlist.count({
      where: {
        userId
      }
    })

    return await this.prisma.playlist.create({
      data: {
        userId,
        title: `Мой плейлист № ${countPlaylists + 1}`
      },
      select: {
        id: true,
        title: true,
        isFixed: true
      }
    })
  }

  async deletePlaylist(userId: string, playlistId: string) {
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
        isFixed: body.isFixed
      }
    })
  }
}
