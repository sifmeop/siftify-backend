import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidationArguments,
  ValidationOptions,
  registerDecorator
} from 'class-validator'

export class SignUpDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string

  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MinLength(4)
  @MaxLength(12)
  username: string

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(24, { message: 'Password must be at most 24 characters' })
  @Matches(/^[a-zA-Z0-9~!?$\\\-_&#<>.()%@]+$/, {
    message: 'Only Latin characters are allowed'
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter'
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter'
  })
  @Matches(/(?=.*[~!?$\-_&#<>.()%@])/, {
    message: 'Password must contain at least one special character'
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one digit' })
  password: string

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(24, { message: 'Password must be at most 24 characters' })
  @IsEqualTo('password', {
    message: 'Passwords must match'
  })
  confirmPassword: string
}

export class SignInDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(24, { message: 'Password must be at most 24 characters' })
  @Matches(/^[a-zA-Z0-9~!?$\\\-_&#<>.()%@]+$/, {
    message: 'Only Latin characters are allowed'
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter'
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter'
  })
  @Matches(/(?=.*[~!?$\-_&#<>.()%@])/, {
    message: 'Password must contain at least one special character'
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one digit' })
  password: string
}

function IsEqualTo(property: string, validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as unknown)[relatedPropertyName]
          return value === relatedValue
        }
      }
    })
  }
}
