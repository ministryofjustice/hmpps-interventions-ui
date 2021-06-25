export default interface Address {
  firstAddressLine: string
  secondAddressLine: string | null
  townOrCity: string
  county: string
  postCode: string
}
