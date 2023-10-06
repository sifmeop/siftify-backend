import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UploadMetaInfo } from 'src/types/upload.interface'

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async uploadMusic(artistDto: UploadMetaInfo) {
    const { artistName, musicTitle } = artistDto

    const isDuplicateTitle = await this.prisma.artist.findFirst({
      where: {
        music: {
          some: {
            title: musicTitle
          }
        }
      }
    })

    console.log(isDuplicateTitle, 'isDuplicateTitle')

    if (isDuplicateTitle) {
      throw new HttpException('Такой трек уже есть', HttpStatus.CONFLICT)
    }

    const isDuplicateArtist = await this.prisma.artist.findFirst({
      where: { name: artistName }
    })

    console.log(isDuplicateArtist, 'isDuplicateArtist')

    if (isDuplicateArtist) {
      const res = await this.prisma.music.create({
        data: {
          artistId: isDuplicateArtist.id,
          title: musicTitle
        }
      })

      console.log(res, 'res')

      throw new HttpException(res, HttpStatus.CREATED)
    } else {
      const artist = await this.prisma.artist.create({
        data: { name: artistName }
      })

      if (!artist) {
        throw new HttpException(
          'Ошибка создания артиста',
          HttpStatus.BAD_REQUEST
        )
      }

      const res = await this.prisma.music.create({
        data: {
          artistId: artist.id,
          title: musicTitle
        }
      })

      console.log(res, 'res')

      throw new HttpException(res, HttpStatus.CREATED)
    }
  }
}
