package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.State
import au.com.dius.pact.provider.junitsupport.loader.PactBroker
import au.com.dius.pact.provider.spring.junit5.PactVerificationSpringProvider
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@PactBroker
@Provider("Interventions Service")
@Tag("pact")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("test", "local", "seed")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PactTest {
  @Autowired private lateinit var referralRepository: ReferralRepository
  @Autowired private lateinit var referralService: ReferralService

  // rely on interventions and users from the seed data for now
  // once we have working factory methods for creating these we should
  // be able to completely decouple from the seed data.
  private val accommodationInterventionID = UUID.fromString("98a42c61-c30f-4beb-8062-04033c376e2d")
  private val deliusUser = AuthUser("8751622134", "delius", "BERNARD.BEAKS")

  @BeforeEach
  fun setup() {
    // start with a clean slate for referrals. this can be removed once we
    // no longer have dependency on the seed migrations (see setup method)
    referralRepository.deleteAll()
  }

  @TestTemplate
  @ExtendWith(PactVerificationSpringProvider::class)
  fun pactVerificationTestTemplate(context: PactVerificationContext) {
    context.verifyInteraction()
  }

  @State("an intervention has been selected and a draft referral can be created")
  fun `no referrals, using intervention id 98a42c61 from seed data`() {}

  @State("There is an existing draft referral with ID of ac386c25-52c8-41fa-9213-fcf42e24b0b5")
  fun `create referral with the required id`() {
    referralService.createDraftReferral(
      user = deliusUser,
      crn = "X123456",
      interventionId = accommodationInterventionID,
      UUID.fromString("ac386c25-52c8-41fa-9213-fcf42e24b0b5"),
    )
  }

  @State(
    "a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists",
    "a single referral for user with ID 8751622134 exists"
  )
  fun `create a new draft referral for 'deliusUser' with a specific createdAt timestamp`() {
    val referral = referralService.createDraftReferral(
      user = deliusUser,
      crn = "X862134",
      interventionId = accommodationInterventionID,
      overrideID = UUID.fromString("dfb64747-f658-40e0-a827-87b4b0bdcfed"),
      overrideCreatedAt = OffsetDateTime.parse("2020-12-07T20:45:21.986389+00:00"),
    )
    referralRepository.save(referral)
  }

  @State("a service category with ID 428ee70f-3001-4399-95a6-ad25eaaede16 exists")
  fun `use service category 428ee70f from the real data migration`() {}

  @State(
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected",
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service provider selected",
  )
  fun `create a new draft referral with accommodation service category and 'HARMONY_LIVING' service provider set (both defaults)`() {
    referralService.createDraftReferral(
      user = deliusUser,
      crn = "X123456",
      interventionId = accommodationInterventionID,
      UUID.fromString("d496e4a7-7cc1-44ea-ba67-c295084f1962"),
    )
  }

  @State("There is an existing draft referral with ID of 037cc90b-beaa-4a32-9ab7-7f79136e1d27, and it has had desired outcomes selected")
  fun `create a new draft referral and add desired outcome IDs as specified in the contract`() {
    val referral = referralService.createDraftReferral(
      user = deliusUser,
      crn = "X123456",
      interventionId = accommodationInterventionID,
      UUID.fromString("037cc90b-beaa-4a32-9ab7-7f79136e1d27"),
    )

    referral.desiredOutcomesIDs = listOf(
      "301ead30-30a4-4c7c-8296-2768abfb59b5",
      "65924ac6-9724-455b-ad30-906936291421"
    ).map { UUID.fromString(it) }
    referralRepository.save(referral)
  }

  @State("There is an existing draft referral with ID of 1219a064-709b-4b6c-a11e-10b8cb3966f6, and it has had a service user selected")
  fun `create a new draft referral with the service user data expected`() {
    val referral = referralService.createDraftReferral(
      user = deliusUser,
      crn = "X862134",
      interventionId = accommodationInterventionID,
      UUID.fromString("1219a064-709b-4b6c-a11e-10b8cb3966f6"),
    )
    referral.serviceUserData = ServiceUserData(
      referral = referral,
      title = "Mr",
      firstName = "Alex",
      lastName = "River",
      dateOfBirth = LocalDate.of(1980, 1, 1),
      gender = "Male",
      preferredLanguage = "English",
      ethnicity = "British",
      religionOrBelief = "Agnostic",
      disabilities = listOf("Autism spectrum condition"),
    )
    referralRepository.save(referral)
  }

  @State("a referral does not exist for user with ID 123344556")
  fun `no setup required`() {}

//  @State("there are some existing sent referrals")
//  fun `create the sent referrals with the required fields`() {}

//  @State("a draft referral with ID 2a67075a-9c77-4103-9de0-63c4cfe3e8d6 exists and is ready to be sent")
//  fun `create a new draft referral with the required fields`() {}

//  @State("There is an existing sent referral with ID of 81d754aa-d868-4347-9c0f-50690773014e")
//  fun `create a new sent referral with the required fields`() {}
}
