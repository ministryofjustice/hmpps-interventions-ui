export default interface Changelog {
  changelogId: string
  referralId: string
  topic: string
  changedAt: string
  description?: string
  name: string
  reasonForChange: string
}
