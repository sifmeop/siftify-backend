import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { AtStrategy, RtStrategy } from './strategies'

@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    AuthService,
    AtStrategy,
    RtStrategy
  ],
  controllers: [AuthController]
})
export class AuthModule {}
