export default class DraftNotFoundView {
  get renderArgs(): [string, Record<string, unknown>] {
    return ['shared/draftNotFound', {}]
  }
}
