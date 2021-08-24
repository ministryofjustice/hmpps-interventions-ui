import { RedisClient } from 'redis'
import { v4 as uuidv4 } from 'uuid'
import { promisify } from 'util'

export interface Draft<T> {
  id: string
  type: string
  createdAt: Date
  createdBy: { id: string }
  updatedAt: Date
  softDeleted: boolean
  data: T
}

interface DraftV1DTO {
  id: string
  type: string
  createdAt: string
  createdBy: { id: string }
  updatedAt: string
  data: unknown
}

interface DraftV2DTO extends DraftV1DTO {
  version: 2
  softDeleted: boolean
}

type DraftDTO = DraftV1DTO | DraftV2DTO
type LatestDraftDTO = DraftV2DTO

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

  private async fetchDraftDTO(id: string): Promise<LatestDraftDTO | null> {
    const response = await promisify(this.redis.get).bind(this.redis)(this.redisKey(id))

    if (response === null) {
      return null
    }

    const dto: DraftDTO = JSON.parse(response)

    return DraftsService.migrateDraftDTO(dto)
  }

  private static migrateDraftDTO(dto: DraftDTO): LatestDraftDTO {
    if (!('version' in dto)) {
      return { ...dto, version: 2, softDeleted: false }
    }

    return dto
  }

  private async writeDraft<Data>(draft: Draft<Data>): Promise<void> {
    const dto: LatestDraftDTO = {
      ...draft,
      version: 2,
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
      softDeleted: false,
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

    const { version, ...dtoWithoutVersion } = dto

    return {
      ...dtoWithoutVersion,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      data: dto.data as Data,
    }
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

    await this.writeDraft({ ...draft, softDeleted: true })
  }
}
