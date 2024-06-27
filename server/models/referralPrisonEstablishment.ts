export default interface ReferralPrisonEstablishment {
  personCustodyPrisonId: string
}

export interface AmendPrisonEstablishmentUpdate extends ReferralPrisonEstablishment {
  reasonForChange: string
}
