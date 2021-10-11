declare module 'govuk-frontend' {
  interface GOVUKFrontend {
    initAll()
  }
}

declare interface Window {
  GOVUKFrontend: GOVUKFrontend
}
