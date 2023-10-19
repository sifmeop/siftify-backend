import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common'
import { GetCurrentUser, GetCurrentUserId, Public } from 'src/common/decorators'
import { RtGuard } from 'src/common/guards'
import { AuthService } from './auth.service'
import { SignInDto, SignUpDto } from './dto'
import { AuthResult } from './types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() signUpDto: SignUpDto): Promise<AuthResult> {
    return this.authService.signUp(signUpDto)
  }

  @Public()
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() SignInDto: SignInDto): Promise<AuthResult> {
    return this.authService.signIn(SignInDto)
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: string) {
    return this.authService.logout(userId)
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string
  ) {
    return this.authService.refreshTokens(userId, refreshToken)
  }
}
