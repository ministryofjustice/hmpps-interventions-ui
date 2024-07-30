export default function getCookieValue(cookieHeader: string[] = []) {
  const regExp = /.*express:sess=(\w*);.*/
  const cookieValBase64 = cookieHeader.reduce((found: string, curr: string) => {
    if (found) return found
    const [, sessToken] = regExp.exec(curr) || []
    return sessToken
  }, '')
  const decodeCookie = Buffer.from(cookieValBase64, 'base64').toString() || ''
  return JSON.parse(decodeCookie)
}
