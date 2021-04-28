export default interface DeliusConviction {
  active: boolean
  convictionDate: string
  convictionId: number
  sentence: Sentence
  offences: Offence[]
}

interface Sentence {
  description: string
  sentenceId: number
  expectedSentenceEndDate: string
  sentenceType: {
    code: string
    description: string
  }
}

interface Offence {
  detail: {
    mainCategoryDescription: string
    subCategoryDescription: string
  }
  mainOffence: boolean
}
