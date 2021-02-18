import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'

describe('Service provider referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  it('User views a list of sent referrals and the referral details page', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          serviceCategoryId: accommodationServiceCategory.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
      sentReferralFactory.build({
        sentAt: '2020-09-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        referral: {
          serviceCategoryId: socialInclusionServiceCategory.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
    ]

    const deliusUser = deliusUserFactory.build({
      firstName: 'Bernard',
      surname: 'Beaks',
      email: 'bernard.beaks@justice.gov.uk',
    })

    const deliusServiceUser = deliusServiceUserFactory.build({
      firstName: 'Jenny',
      surname: 'Jones',
      dateOfBirth: '1980-01-01',
      contactDetails: {
        emailAddresses: ['jenny.jones@example.com'],
        phoneNumbers: [
          {
            number: '07123456789',
            type: 'MOBILE',
          },
        ],
      },
    })

    const referralToSelect = sentReferrals[1]

    cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
    cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
    sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
    cy.stubGetSentReferrals(sentReferrals)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetServiceUserByCRN(referralToSelect.referral.serviceUser.crn, deliusServiceUser)

    cy.login()

    cy.get('h1').contains('All cases')

    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          'Date received': '26 Jan 2021',
          'Intervention type': 'Accommodation',
          Referral: 'ABCABCA1',
          'Service user': 'George Michael',
        },
        {
          'Date received': '13 Sep 2020',
          'Intervention type': 'Social inclusion',
          Referral: 'ABCABCA2',
          'Service user': 'Jenny Jones',
        },
      ])

    cy.contains('ABCABCA2').click()
    cy.location('pathname').should('equal', `/service-provider/referrals/${referralToSelect.id}`)
    cy.get('h1').contains('Who do you want to assign this social inclusion referral to?')
    cy.contains('07123456789 | jenny.jones@example.com')
    cy.contains('Social inclusion intervention details')
    cy.contains('Service User makes progress in obtaining accommodation')
    cy.contains('Service User is helped to secure a tenancy in the private rented sector (PRS)')
    cy.contains('Medium complexity')
    cy.contains(
      'Service User is at risk of homelessness/is homeless, or will be on release from prison. Service User has had some success in maintaining atenancy but may have additional needs e.g. Learning Difficulties and/or Learning Disabilities or other challenges currently.'
    )
    cy.contains("Service user's personal details")
    cy.contains('English')
    cy.contains('Agnostic')
    cy.contains('Autism spectrum condition')
    cy.contains('sciatica')
    cy.contains('Service User is helped to secure a tenancy in the private rented sector (PRS)')
    cy.contains("Service user's risk information")
    cy.contains('Risk to known adult')
    cy.contains('Medium')
    cy.contains('A danger to the elderly')
    cy.contains("Service user's needs")
    cy.contains('Alex is currently sleeping on her aunt’s sofa')
    cy.contains('She uses a wheelchair')
    cy.contains('Spanish')
    cy.contains('She works Mondays 9am - midday')
    cy.contains('Bernard Beaks')
    cy.contains('bernard.beaks@justice.gov.uk')
  })
})
