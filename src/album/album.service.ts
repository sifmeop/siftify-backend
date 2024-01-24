import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AlbumService {
  constructor(private prisma: PrismaService) {}

  async getAlbumById(userId: string, albumId: string) {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
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
        },
        artist: {
          select: {
            name: true,
            artistPhoto: true
          }
        }
      }
    })

    if (!album) {
      throw new HttpException('Album not found', HttpStatus.NOT_FOUND)
    }

    return {
      ...album,
      tracks: album.tracks.map((track) => ({
        ...track,
        album: {
          id: album.id,
          title: album.title
        },
        featuring: track.featuring.map((feat) => ({
          artistId: feat.artistId,
          name: feat.artist.name
        }))
      }))
    }
  }
}
