export interface Upload {
  cover: Express.Multer.File
  audio: Express.Multer.File
}

export interface UploadArtistDto {
  trackTitle: string
  featuring: string
}
