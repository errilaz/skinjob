export type Plugin = {
  readonly runner?: RunnerConfiguration
}

export type RunnerCommandOptions = {
  readonly production: boolean
  readonly root: string
  readonly path: string
}

export type RunnerConfiguration = {
  readonly pattern: string
  readonly watch?: boolean
  readonly command: (options: RunnerCommandOptions) => string
  readonly cleanup?: (options: RunnerCommandOptions) => string
}
