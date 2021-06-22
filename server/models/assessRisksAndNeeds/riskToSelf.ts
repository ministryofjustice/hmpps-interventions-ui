export type RiskResponse = 'YES' | 'NO' | 'DK'

export interface Risk {
  risk: RiskResponse | null
  previous: string | null
  current: string | null
}

export default interface RiskToSelf {
  suicide?: Risk
  selfHarm?: Risk
  hostelSetting?: Risk
  vulnerability?: Risk
}
