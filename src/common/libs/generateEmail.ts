export const generateEmail = (username: string): string => {
  const domain = 'siftify.com'

  const uniqueId = Math.floor(Math.random() * 1000000)

  const email = `${username
    .toLowerCase()
    .replace(/\s/g, '')}${uniqueId}@${domain}`

  return email
}
