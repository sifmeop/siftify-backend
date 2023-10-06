import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
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
    UploadModule
  ],
  providers: []
})
export class AppModule {}
