export namespace RichText {
  export type Span = {
    at: Attributes
    ch: Child[]
  }

  export type Child = Span | string

  export type Content =
    | Child
    | Partial<Attributes>
    | number
    | boolean
    | null
    | undefined

  export type Attributes = {
    /** Foreground color. */
    c?: number
    /** Background color. */
    h?: number
    /** Bold. */
    b?: boolean
    /** Italic. */
    i?: boolean
    /** Underline. */
    u?: boolean
    /** Strikethrough. */
    s?: boolean
    /** Monospace. */
    m?: boolean
    /** Spoiler. */
    x?: boolean
    /** Pre-formatted block. */
    p?: string
  }

  /** Strip formatting and return a plain text string. */
  export function strip(span: Span): string {
    return span.ch
      .map((c) => {
        if (typeof c === "string") return c
        else return strip(c)
      })
      .join("")
  }

  /** Insert a zero-width space as the second character in a string. Can be used
   * to disable client-side word/nickname highlighting. */
  export function nerf(s: string) {
    return s[0] + String.fromCharCode(0x200b) + s.substring(1)
  }

  /** Convert rich text to a string with the provided implementation. */
  export function format(
    span: Span,
    render: (attr: Attributes, text: string) => string,
  ): string {
    let out = ""
    for (const child of span.ch) {
      if (typeof child === "string") {
        out += render(span.at, child)
      } else {
        out += format(
          {
            at: { ...span.at, ...child.at },
            ch: child.ch,
          },
          render,
        )
      }
    }
    return out
  }
}

/** Create a span of rich text. */
export function span(...contents: RichText.Content[]) {
  const span: RichText.Span = {
    at: {},
    ch: [],
  }
  for (const c of contents) {
    if (c === null || c === undefined || typeof c === "boolean") {
      // Short-circuit
    } else if (typeof c === "string" || typeof c === "number") {
      if (typeof span.ch[span.ch.length - 1] === "string") {
        span.ch[span.ch.length - 1] += c.toString()
      } else {
        span.ch.push(c.toString())
      }
    } else if ("ch" in c) {
      span.ch.push(c)
    } else {
      Object.assign(span.at, c)
    }
  }
  return span
}

export function bold(...contents: RichText.Content[]) {
  return span(bold, ...contents)
}
bold.b = true

export function italic(...contents: RichText.Content[]) {
  return span(italic, ...contents)
}
italic.i = true

export function underline(...contents: RichText.Content[]) {
  return span(underline, ...contents)
}
underline.u = true

export function strike(...contents: RichText.Content[]) {
  return span(strike, ...contents)
}
strike.s = true

export function monospace(...contents: RichText.Content[]) {
  return span(monospace, ...contents)
}
monospace.m = true

export function spoiler(...contents: RichText.Content[]) {
  return span(spoiler, ...contents)
}
spoiler.x = true

export function pre(formatted: string, ...contents: RichText.Content[]) {
  return span({ p: formatted }, ...contents)
}

export enum Colors {
  white = 0,
  black = 1,
  blue = 2,
  green = 3,
  red = 4,
  brown = 5,
  magenta = 6,
  orange = 7,
  yellow = 8,
  lime = 9,
  cyan = 10,
  teal = 11,
  sky = 12,
  pink = 13,
  gray = 14,
  silver = 15,
}

export function white(...contents: RichText.Content[]) {
  return span(white, ...contents)
}
white.c = Colors.white

export function black(...contents: RichText.Content[]) {
  return span(black, ...contents)
}
black.c = Colors.black

export function blue(...contents: RichText.Content[]) {
  return span(blue, ...contents)
}
blue.c = Colors.blue

export function green(...contents: RichText.Content[]) {
  return span(green, ...contents)
}
green.c = Colors.green

export function red(...contents: RichText.Content[]) {
  return span(red, ...contents)
}
red.c = Colors.red

export function brown(...contents: RichText.Content[]) {
  return span(brown, ...contents)
}
brown.c = Colors.brown

export function orange(...contents: RichText.Content[]) {
  return span(orange, ...contents)
}
orange.c = Colors.orange

export function yellow(...contents: RichText.Content[]) {
  return span(yellow, ...contents)
}
yellow.c = Colors.yellow

export function lime(...contents: RichText.Content[]) {
  return span(lime, ...contents)
}
lime.c = Colors.lime

export function cyan(...contents: RichText.Content[]) {
  return span(cyan, ...contents)
}
cyan.c = Colors.cyan

export function teal(...contents: RichText.Content[]) {
  return span(teal, ...contents)
}
teal.c = Colors.teal

export function sky(...contents: RichText.Content[]) {
  return span(sky, ...contents)
}
sky.c = Colors.sky

export function pink(...contents: RichText.Content[]) {
  return span(pink, ...contents)
}
pink.c = Colors.pink

export function gray(...contents: RichText.Content[]) {
  return span(gray, ...contents)
}
gray.c = Colors.gray

export function silver(...contents: RichText.Content[]) {
  return span(silver, ...contents)
}
silver.c = Colors.silver
