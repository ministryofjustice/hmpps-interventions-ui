import { Request } from 'express'
import uuid from 'uuid'

export interface Draft<T> {
  id: string
  type: string
  createdAt: Date
  updatedAt: Date
  data: T
}

interface DraftDTO {
  id: string
  type: string
  createdAt: string
  updatedAt: string
  data: unknown
}

export interface Clock {
  now: () => Date
}

export default class DraftsService {
  constructor(private readonly clock: Clock) {}

  private sessionKey(id: string): string {
    return `draft:${id}`
  }

  private fetchDraftDTO(id: string, req: Request): DraftDTO | null {
    const dto = req.session[this.sessionKey(id)]

    return dto ?? null
  }

  private writeDraft<Data>(draft: Draft<Data>, req: Request) {
    req.session[this.sessionKey(draft.id)] = {
      ...draft,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    }
  }

  createDraft<Data>(type: string, initialData: Data, req: Request): Draft<Data> {
    const now = this.clock.now()
    const draft: Draft<Data> = { id: uuid.v4(), type, data: initialData, createdAt: now, updatedAt: now }

    this.writeDraft(draft, req)

    return draft
  }

  fetchDraft<Data>(id: string, req: Request): Draft<Data> | null {
    const dto = this.fetchDraftDTO(id, req)

    if (dto === null) {
      return null
    }

    return { ...dto, createdAt: new Date(dto.createdAt), updatedAt: new Date(dto.updatedAt), data: dto.data as Data }
  }

  updateDraft<Data>(id: string, newData: Data, req: Request): void {
    const draft = this.fetchDraft(id, req)

    if (draft === null) {
      throw new Error(`Draft with ID ${id} not found in session`)
    }

    this.writeDraft({ ...draft, data: newData, updatedAt: this.clock.now() }, req)
  }

  deleteDraft(id: string, req: Request): void {
    const draft = this.fetchDraft(id, req)

    if (draft === null) {
      throw new Error(`Draft with ID ${id} not found in session`)
    }

    delete req.session[this.sessionKey(id)]
  }
}
