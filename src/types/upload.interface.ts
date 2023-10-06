export interface Upload {
  poster: Express.Multer.File
  audio: Express.Multer.File
  meta: UploadMetaInfo
}

export interface UploadMetaInfo {
  artistName: string
  musicTitle: string
}
