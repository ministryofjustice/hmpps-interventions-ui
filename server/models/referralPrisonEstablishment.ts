export default interface ReferralPrisonEstablishment {
  personCustodyPrisonId: string
  oldPrisonEstablishment: string
  newPrisonEstablishment: string
}

export interface AmendPrisonEstablishmentUpdate extends ReferralPrisonEstablishment {
  reasonForChange: string
}
