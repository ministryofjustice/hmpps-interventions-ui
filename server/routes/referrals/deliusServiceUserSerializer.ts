import { DeliusServiceUser } from '../../services/communityApiService'
import { ServiceUser } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'

export default class DeliusServiceUserSerializer {
  constructor(private readonly deliusServiceUser: DeliusServiceUser) {}

  call(): ServiceUser {
    return {
      crn: this.deliusServiceUser.otherIds.crn,
      title: this.deliusServiceUser.title || null,
      firstName: this.deliusServiceUser.firstName || null,
      lastName: this.deliusServiceUser.surname || null,
      contactDetails: {
        email: this.email,
        mobile: this.mobile,
      },
      dateOfBirth: this.iso8601DateOfBirth || null,
      gender: this.deliusServiceUser.gender || null,
      ethnicity: this.deliusServiceUser.offenderProfile?.ethnicity || null,
      preferredLanguage: this.deliusServiceUser.offenderProfile?.offenderLanguages?.primaryLanguage || null,
      religionOrBelief: this.deliusServiceUser.offenderProfile?.religion || null,
      disabilities: this.currentDisabilities,
    }
  }

  private get currentDisabilities(): string[] | null {
    return this.deliusServiceUser.offenderProfile?.disabilities
      ? this.deliusServiceUser.offenderProfile.disabilities
          .filter(disability => {
            const today = new Date().toString()
            return disability.endDate === '' || Date.parse(disability.endDate) >= Date.parse(today)
          })
          .map(disability => disability.disabilityType.description)
      : null
  }

  private get iso8601DateOfBirth(): string | null {
    return this.deliusServiceUser.dateOfBirth
      ? CalendarDay.parseIso8601(this.deliusServiceUser.dateOfBirth)?.iso8601 || null
      : null
  }

  private get email(): string | null {
    const { emailAddresses } = this.deliusServiceUser.contactDetails

    if (emailAddresses && emailAddresses.length > 0) {
      return emailAddresses[0]
    }

    return null
  }

  private get mobile(): string | null {
    const { phoneNumbers } = this.deliusServiceUser.contactDetails

    if (phoneNumbers) {
      const mobileNumber = phoneNumbers.find(phoneNumber => phoneNumber.type === 'MOBILE')

      return mobileNumber ? mobileNumber.number : null
    }

    return null
  }
}
