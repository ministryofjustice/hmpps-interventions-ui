import { RedisClient } from 'redis'
import { v4 as uuidv4 } from 'uuid'
import { promisify } from 'util'

export interface Draft<T> {
  id: string
  type: string
  createdAt: Date
  createdBy: { id: string }
  updatedAt: Date
  data: T
}

interface DraftDTO {
  id: string
  type: string
  createdAt: string
  createdBy: { id: string }
  updatedAt: string
  data: unknown
}

export interface Clock {
  now: () => Date
}

export default class DraftsService {
  constructor(
    private readonly redis: RedisClient,
    private readonly expiry: { seconds: number },
    private readonly clock: Clock
  ) {}

  private redisKey(id: string): string {
    return `draft:${id}`
  }

  private async fetchDraftDTO(id: string): Promise<DraftDTO | null> {
    const response = await promisify(this.redis.get).bind(this.redis)(this.redisKey(id))

    if (response === null) {
      return null
    }

    return JSON.parse(response)
  }

  private async writeDraft<Data>(draft: Draft<Data>): Promise<void> {
    const dto: DraftDTO = {
      ...draft,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    }

    await promisify<string, string, string, number>(this.redis.set).bind(this.redis)(
      this.redisKey(draft.id),
      JSON.stringify(dto),
      'EX', // Set the following expiry time on this key
      this.expiry.seconds
    )
  }

  async createDraft<Data>(type: string, initialData: Data, { userId }: { userId: string }): Promise<Draft<Data>> {
    const now = this.clock.now()
    const draft: Draft<Data> = {
      id: uuidv4(),
      type,
      data: initialData,
      createdAt: now,
      createdBy: { id: userId },
      updatedAt: now,
    }

    await this.writeDraft(draft)

    return draft
  }

  async fetchDraft<Data>(id: string, { userId }: { userId: string }): Promise<Draft<Data> | null> {
    const dto = await this.fetchDraftDTO(id)

    if (dto === null) {
      return null
    }

    if (dto.createdBy.id !== userId) {
      throw new Error(`Attempted to fetch DTO for draft ${id} not created by requesting user.`)
    }

    return { ...dto, createdAt: new Date(dto.createdAt), updatedAt: new Date(dto.updatedAt), data: dto.data as Data }
  }

  async updateDraft<Data>(id: string, newData: Data, { userId }: { userId: string }): Promise<void> {
    const draft = await this.fetchDraft(id, { userId })

    if (draft === null) {
      throw new Error(`Draft with ID ${id} not found in Redis`)
    }

    await this.writeDraft({ ...draft, data: newData, updatedAt: this.clock.now() })
  }

  async deleteDraft(id: string, { userId }: { userId: string }): Promise<void> {
    const draft = await this.fetchDraft(id, { userId })

    if (draft === null) {
      throw new Error(`Draft with ID ${id} not found in Redis`)
    }

    const numberRemoved = await promisify<string, number>(this.redis.del).bind(this.redis)(this.redisKey(id))

    if (numberRemoved === 0) {
      throw new Error(`Draft with ID ${id} not found in Redis`)
    }
  }
}
