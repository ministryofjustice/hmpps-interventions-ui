declare module 'express-request-id' {
  import type { Request, RequestHandler } from 'express'

  export type Options = {
    setHeader?: boolean
    headerName?: string
    generator?: (request: Request) => string
  }

  export default function addRequestId(options?: Options): RequestHandler
}
