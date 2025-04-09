import { createClient } from 'redis'

// a simple persistent key value store for user data
export default class UserDataService {
  constructor(private readonly client: ReturnType<typeof createClient>) {}

  async store(userId: string, key: string, value: string, expireAfterSeconds: number): Promise<string | null> {
    return this.set(this.makeRedisKey(userId, key), value, expireAfterSeconds)
  }

  async retrieve(userId: string, key: string): Promise<string | null> {
    return this.get(this.makeRedisKey(userId, key))
  }

  private makeRedisKey(userId: string, key: string): string {
    return `${userId}:${key}`
  }

  private async set(key: string, value: string, ex: number): Promise<string | null> {
    return this.client.set(key, value, { EX: ex })
  }

  private async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }
}
