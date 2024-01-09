import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateArtistDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  name: string
}
