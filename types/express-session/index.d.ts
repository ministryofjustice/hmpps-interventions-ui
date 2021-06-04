// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionData } from 'express-session'

declare module 'express-session' {
  interface SessionData {
    // This is used by the passport module, but it doesn’t declare it
    returnTo: string
    // We populate this in app.ts although I’m not convinced anything
    // uses it
    nowInMinutes: number
  }
}
