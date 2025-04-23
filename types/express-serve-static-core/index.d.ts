import 'express'

declare global {
  namespace Express {
    interface Request {
      csrfToken?: (overwrite?: boolean) => ReturnType<CsrfTokenGenerator>
      body: {
        _csrf?: string // Add other fields in the body as needed
      }
    }
  }
}
