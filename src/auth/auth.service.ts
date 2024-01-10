import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { SignInDto, SignUpDto } from './dto'
import { AuthResult, Tokens } from './types'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResult> {
    const userEmail = await this.prisma.user.findFirst({
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

    if (userEmail) {
      throw new HttpException(
        `Email ${signUpDto.email} already exists`,
        HttpStatus.CONFLICT
      )
    }

    let uId = 100000

    const lastUser = await this.prisma.user.aggregate({
      _max: {
        uId: true
      }
    })

    if (lastUser._max.uId) {
      uId = lastUser._max.uId + 1
    }

    const newUser: User = await this.prisma.user.create({
      data: {
        uId,
        email: signUpDto.email,
        username: signUpDto.username,
        password: await this.hashData(signUpDto.password)
      }
    })

    await this.prisma.userPlainPassword.create({
      data: {
        userId: newUser.id,
        password: signUpDto.password
      }
    })

    const tokens = await this.getTokens(newUser.id, newUser.email)
    await this.updateRefreshToken(newUser.id, tokens.refresh_token)

    delete newUser.refreshToken

    return {
      ...newUser,
      ...tokens
    }
  }

  async signIn(SignInDto: SignInDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: SignInDto.email }
    })

    if (!user) {
      throw new HttpException(
        `Email ${SignInDto.email} doesn't exists`,
        HttpStatus.NOT_FOUND
      )
    }

    const passwordMatches = await bcrypt.compare(
      SignInDto.password,
      user.password
    )

    if (!passwordMatches) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED)
    }

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRefreshToken(user.id, tokens.refresh_token)

    delete user.refreshToken

    return {
      ...user,
      ...tokens
    }
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null
        }
      },
      data: {
        refreshToken: null
      }
    })
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user?.refreshToken) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN)
    }

    const rtMatches = await bcrypt.compare(rt, user.refreshToken)

    if (!rtMatches) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN)
    }

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRefreshToken(user.id, tokens.refresh_token)

    return tokens
  }

  async updateRefreshToken(userId: string, rt: string) {
    const refreshToken = await this.hashData(rt)
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken }
    })
  }

  async verifyToken(sub: string, email: string) {
    const tokens = await this.getTokens(sub, email)

    const isVerify = await this.jwtService.verify(tokens.access_token, {
      secret: process.env.AT_SECRET_KEY
    })

    if (!isVerify) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN)
    }

    let user: any = await this.prisma.user.findFirst({
      where: { email: isVerify.email },
      include: { artist: true }
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    if (user.role === 'ARTIST') {
      const artist = await this.prisma.artist.findFirst({
        where: { userId: user.id }
      })
      user = {
        ...user,
        artistName: artist.name
      }
    }

    delete user.refreshToken

    return {
      ...user,
      ...tokens
    }
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10)
  }

  async getTokens(sub: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub, email },
        {
          secret: process.env.AT_SECRET_KEY,
          expiresIn: 60 * 60 * 24
        }
      ),
      this.jwtService.signAsync(
        { sub, email },
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
