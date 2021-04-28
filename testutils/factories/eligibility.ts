import { Factory } from 'fishery'
import { Eligibility } from '../../server/models/intervention'

class EligibilityFactory extends Factory<Eligibility> {
  allAdults() {
    return this.params({
      minimumAge: 18,
      maximumAge: null,
      allowsMale: true,
      allowsFemale: true,
    })
  }

  anyAdultMale() {
    return this.params({
      minimumAge: 18,
      maximumAge: null,
      allowsMale: true,
      allowsFemale: false,
    })
  }

  anyAdultFemale() {
    return this.params({
      minimumAge: 18,
      maximumAge: null,
      allowsMale: false,
      allowsFemale: true,
    })
  }

  youngAdultMales() {
    return this.params({
      minimumAge: 18,
      maximumAge: 25,
      allowsMale: true,
      allowsFemale: false,
    })
  }
}

export default EligibilityFactory.define(() => ({
  minimumAge: 18,
  maximumAge: 24,
  allowsMale: true,
  allowsFemale: true,
}))
