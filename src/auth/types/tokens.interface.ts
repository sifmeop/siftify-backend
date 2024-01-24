import { User } from '@prisma/client'

export interface Tokens {
  access_token: string
  refresh_token: string
}

type ResultUser = Omit<User, 'refreshToken'>

export interface AuthResult {
  user: ResultUser & Tokens
  favoriteTracksIds: string[]
}
