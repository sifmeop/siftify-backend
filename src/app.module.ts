import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { MulterModule } from '@nestjs/platform-express'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AlbumModule } from './album/album.module'
import { ArtistModule } from './artist/artist.module'
import { AuthModule } from './auth/auth.module'
import { AtGuard } from './common/guards'
import { PlaylistModule } from './playlist/playlist.module'
import { PrismaModule } from './prisma/prisma.module'
import { SearchModule } from './search/search.module'
import { TrackModule } from './track/track.module'
import { UploadModule } from './upload/upload.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    MulterModule.register({ dest: './uploads' }),
    AuthModule,
    UserModule,
    PrismaModule,
    UploadModule,
    TrackModule,
    ArtistModule,
    SearchModule,
    AlbumModule,
    PlaylistModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    }
  ]
})
export class AppModule {}
