export type Plugin = {
  readonly runner?: RunnerConfiguration
}

export type RunnerConfiguration = {
  readonly pattern: string
  readonly command: (options: {
    readonly production: boolean
    readonly root: string
    readonly path: string
  }) => string
}
