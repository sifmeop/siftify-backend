import { hashPassword } from './hashPassword'

interface Result {
  password: string
  hashedPassword: string
}

export const generatePassword = async (): Promise<Result> => {
  const minLength = 8
  const maxLength = 24
  const allowedChars = 'a-zA-Z0-9~!?$\\-_&#<>.()%@'

  let password = ''

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  for (let i = 0; i < minLength; i++) {
    const randomIndex = getRandomInt(0, allowedChars.length - 1)
    password += allowedChars.charAt(randomIndex)
  }

  const additionalCharsCount = getRandomInt(0, maxLength - minLength)
  for (let i = 0; i < additionalCharsCount; i++) {
    const randomChar = String.fromCharCode(getRandomInt(33, 126)) // ASCII characters from '!' to '~'
    password += randomChar
  }

  const hashedPassword = await hashPassword(password)

  return { password, hashedPassword }
}
