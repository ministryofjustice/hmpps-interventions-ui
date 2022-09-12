export default interface ChangelogDetail {
  changelogId: string
  referralId: string
  topic: string
  oldValue: string[]
  newValue: string[]
  name: string
  reasonForChange: string
}
