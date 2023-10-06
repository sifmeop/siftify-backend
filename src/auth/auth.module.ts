import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { jwtConstants } from './constants'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' }
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    AuthService
  ],
  controllers: [AuthController]
})
export class AuthModule {}
