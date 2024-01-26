export interface IEditPlaylist {
  id: string
  title: string
  description?: string
}

export interface IEditPlaylistFile {
  cover?: Express.Multer.File
}
