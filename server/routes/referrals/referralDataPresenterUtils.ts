import { DraftReferral } from '../../services/interventionsService'

// This way of extracting all of a type’s properties of a particular type is taken from
// https://stackoverflow.com/questions/56558289/typescript-generic-type-restriction-on-return-value-of-keyof
type PropertiesOfType<TObj, TResult> = { [K in keyof TObj]: TObj[K] extends TResult ? K : never }[keyof TObj]

export default class ReferralDataPresenterUtils {
  constructor(
    private readonly referral: DraftReferral,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  stringValue<K extends PropertiesOfType<DraftReferral, string | null>>(referralKey: K, userInputKey: string): string {
    if (this.userInputData === null) {
      return this.referral[referralKey] ?? ''
    }
    return String(this.userInputData[userInputKey] ?? '')
  }

  booleanValue<K extends PropertiesOfType<DraftReferral, boolean | null>>(
    referralKey: K,
    userInputKey: string
  ): boolean | null {
    if (this.userInputData === null) {
      return this.referral[referralKey]
    }
    if (this.userInputData[userInputKey] === 'yes') {
      return true
    }
    if (this.userInputData[userInputKey] === 'no') {
      return false
    }
    return null
  }
}
