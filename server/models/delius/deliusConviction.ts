export default interface DeliusConviction {
  active: boolean
  convictionDate: string
  convictionId: number
  sentence: Sentence
  offences: Offence[]
}

export interface Sentence {
  description: string
  sentenceId: number
  expectedSentenceEndDate: string
  sentenceType: {
    code: string
    description: string
  }
}

export interface Offence {
  detail: {
    mainCategoryDescription: string
    subCategoryDescription: string
  }
  mainOffence: boolean
}
