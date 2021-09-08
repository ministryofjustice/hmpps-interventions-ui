import User from './hmppsAuth/user'

export interface CaseNote {
  id: string
  referralId: string
  subject: string
  body: string
  sentBy: User
  sentAt: string
}
