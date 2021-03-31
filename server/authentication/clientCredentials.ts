export default function generateOauthClientBaiscAuthHeader(clientId: string, clientSecret: string): string {
  // create a base64 encoded basic auth header for oauth2 token requests
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  return `Basic ${token}`
}
