import DeliusServiceUser from './deliusServiceUser'

export interface CaseConvictions {
  caseDetail: DeliusServiceUser
  convictions: DeliusConviction[]
}

export interface CaseConviction {
  caseDetail: DeliusServiceUser
  conviction: DeliusConviction
}

export interface DeliusConviction {
  date: string
  id: number
  sentence: Sentence
  mainOffence: Offence
}

export interface Sentence {
  description: string
  expectedEndDate: string
}

export interface Offence {
  category: string
  subCategory: string
}
