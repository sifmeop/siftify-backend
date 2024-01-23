export interface Upload {
  cover: Express.Multer.File
  tracksFiles: Express.Multer.File[]
}

export interface UploadDtoBody {
  albumName?: string
  tracksData: string
}

interface UploadDto<T> {
  title: string
  featuring: T
  trackFileName: string
}

export interface UploadFeaturing {
  label: string
  value: string
  isNew: boolean
}

export interface IFeaturing {
  id: string
  name: string
}

export type ParsedUploadDtoWithoutFeat = UploadDto<string>
export type ParsedUploadDtoWithFeat = UploadDto<UploadFeaturing[]>
export type UploadDtoWithFeat = UploadDto<IFeaturing[]>

export interface IUploadCover {
  cover: Express.Multer.File
}
