export default class DraftSoftDeletedView {
  get renderArgs(): [string, Record<string, unknown>] {
    return ['shared/draftSoftDeleted', {}]
  }
}
