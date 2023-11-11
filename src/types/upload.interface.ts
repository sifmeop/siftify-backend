export interface Upload {
  cover: Express.Multer.File
  audio: Express.Multer.File
}

export interface UploadArtistDto {
  artistName: string
  trackTitle: string
  featuring: string
}
