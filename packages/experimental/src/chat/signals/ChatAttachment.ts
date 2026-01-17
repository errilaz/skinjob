export type ChatAttachment =
| ChatImageAttachment
| ChatAudioAttachment
| ChatVideoAttachment

export type ChatImageAttachment = {
  readonly type: "image"
  readonly contentType: string
  readonly url: string
  readonly size?: number
  readonly width?: number
  readonly height?: number
}

export type ChatAudioAttachment = {
  readonly type: "audio"
  readonly contentType: string
  readonly url: string
  readonly size?: number
  readonly duration?: number
  readonly waveform?: string
}

export type ChatVideoAttachment = {
  readonly type: "video"
  readonly contentType: string
  readonly url: string
  readonly size?: number
  readonly width?: number
  readonly height?: number
  readonly duration?: number
}