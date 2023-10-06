import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Role } from 'src/enums/role.enum'
import { SignInType } from 'src/types/sign-up.type'
import { PrismaService } from '../prisma/prisma.service'
import { SignUpDto } from './dto'
import { Tokens } from './types'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<Tokens> {
    const user = await this.prisma.user.findFirst({
      where: { email: signUpDto.email }
    })

    const userNickname = await this.prisma.user.findFirst({
      where: { username: signUpDto.username }
    })

    if (userNickname) {
      throw new HttpException(
        `Username ${signUpDto.username} already exists`,
        HttpStatus.CONFLICT
      )
    }

    if (user) {
      throw new HttpException(
        `Email ${signUpDto.email} already exists`,
        HttpStatus.CONFLICT
      )
    }

    let uId: number = 1

    const lastUser = await this.prisma.user.findFirst({
      orderBy: { uId: 'desc' }
    })

    if (lastUser) uId = lastUser.uId + 1

    const newUser = await this.prisma.user.create({
      data: {
        uId,
        email: signUpDto.email,
        role: Role.User,
        username: signUpDto.username,
        password: await this.hashData(signUpDto.password)
      }
    })

    const tokens = await this.getTokens(newUser.uId, newUser.email)
    await this.updateRefreshToken(newUser.id, tokens.refresh_token)

    return tokens
  }

  async updateRefreshToken(userId: string, rt: string) {
    const refreshToken = await this.hashData(rt)
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken }
    })
  }

  async signIn(signInDto: SignInType) {
    return ''
  }

  async logout() {
    return ''
  }

  async refreshTokens() {
    return ''
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10)
  }

  async getTokens(uid: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: uid,
          email
        },
        {
          secret: process.env.AT_SECRET_KEY,
          expiresIn: 60 * 15
        }
      ),
      this.jwtService.signAsync(
        {
          sub: uid,
          email
        },
        {
          secret: process.env.RT_SECRET_KEY,
          expiresIn: 60 * 60 * 24 * 7
        }
      )
    ])

    return {
      access_token: at,
      refresh_token: rt
    }
  }
}
