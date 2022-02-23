import md5 from 'md5'
import LoggedInUser from '../models/loggedInUser'

export default class FeatureFlagService {
  static enableForUser(user: LoggedInUser, percentageTrue: number): boolean {
    // clamp percentages to 0-100
    const multiplier = Math.min(Math.max(percentageTrue, 0), 100) / 100

    // using the first 32 bits of the hash is fine for what we need
    const maxHash = 2 ** 32 - 1
    const truncatedHash = md5(user.userId).substring(0, 8)
    return parseInt(truncatedHash, 16) < maxHash * multiplier
  }
}
