import { RichText } from "@skinjob/rich-text"
import type { Attachment, Collection } from "discord.js"

export function getBusText(
  cleanContent: string,
  attachments: Collection<string, Attachment>,
) {
  let text = cleanContent
  if (attachments.size > 0) {
    text += " "
    text += attachments.map((a) => a.url).join(" ")
  }
  return text
}

export function splitMaxLength(source: string, maxLength: number) {
  const parts: string[] = []
  let current = ""

  for (const word of source.split(" ")) {
    if ((current + word).length + (current ? 1 : 0) <= maxLength) {
      current += (current ? " " : "") + word
    } else {
      if (current) parts.push(current)
      if (word.length > maxLength) {
        for (let i = 0; i < word.length; i += maxLength)
          parts.push(word.slice(i, i + maxLength))
        current = ""
      } else {
        current = word
      }
    }
  }
  if (current) parts.push(current)
  return parts
}

export function renderRichText(span: RichText.Span) {
  return RichText.format(
    span,
    (attr, text) => writeCodes(attr) + text + writeCodes(attr),
  )
}

function writeCodes(attr: RichText.Attributes) {
  let out = ""
  if (attr.b) out += "**"
  if (attr.i) out += "*"
  if (attr.u) out += "__"
  if (attr.s) out += "~~"
  if (attr.m) out += "`"
  if (attr.x) out += "||"
  return out
}
