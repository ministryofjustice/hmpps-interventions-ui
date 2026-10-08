import { AsyncLocalStorage } from 'async_hooks'

const MAX_SEARCH_DEPTH = 8

// Request-scoped store of the people on probation (CRNs) and referrals (reference numbers) whose data was
// fetched while handling a request, so audit events can name the subjects that were actually viewed or changed.
export default class AuditContext {
  private static storage = new AsyncLocalStorage<AuditContext>()

  readonly crns = new Set<string>()

  readonly referenceNumbers = new Set<string>()

  static run<T>(context: AuditContext, fn: () => T): T {
    return AuditContext.storage.run(context, fn)
  }

  static current(): AuditContext | undefined {
    return AuditContext.storage.getStore()
  }

  static recordSubjectsFrom(responseBody: unknown): void {
    const context = AuditContext.current()
    if (context) {
      context.collectSubjects(responseBody, 0)
    }
  }

  private collectSubjects(value: unknown, depth: number): void {
    if (depth > MAX_SEARCH_DEPTH || value === null || typeof value !== 'object' || Buffer.isBuffer(value)) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach(item => this.collectSubjects(item, depth + 1))
      return
    }

    Object.entries(value).forEach(([key, child]) => {
      if (key === 'crn' && typeof child === 'string' && child.length > 0) {
        this.crns.add(child)
      } else if (key === 'referenceNumber' && typeof child === 'string' && child.length > 0) {
        this.referenceNumbers.add(child)
      } else {
        this.collectSubjects(child, depth + 1)
      }
    })
  }
}
