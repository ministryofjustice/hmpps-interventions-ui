import { RedisClient } from 'redis'
import { promisify } from 'util'

// a simple persistent key value store for user data
export default class UserDataService {
  constructor(private readonly client: RedisClient) {}

  async store(userId: string, key: string, value: string, expireAfterSeconds: number): Promise<boolean> {
    return this.set(this.makeRedisKey(userId, key), value, expireAfterSeconds)
  }

  async retrieve(userId: string, key: string): Promise<string | null> {
    return this.get(this.makeRedisKey(userId, key))
  }

  private makeRedisKey(userId: string, key: string): string {
    return `${userId}:${key}`
  }

  private async set(key: string, value: string, ex: number): Promise<boolean> {
    return this.client.setex(key, ex, value)
  }

  private async get(key: string): Promise<string | null> {
    return promisify(this.client.get).bind(this.client)(key)
  }
}
