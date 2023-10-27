export interface Upload {
  poster: Express.Multer.File
  audio: Express.Multer.File
}

export interface UploadArtistDto {
  artistName: string
  trackTitle: string
}
