export const getArtistsPath = (artistName: string) => {
  return `/artists/${artistName
    .toLowerCase()
    .replace('.', '')
    .replace(' ', '-')}`
}
