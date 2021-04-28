package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import java.time.OffsetDateTime
import java.util.UUID

class ReferralContracts(private val setupAssistant: SetupAssistant) {
  @State("There is an existing sent referral with ID of 2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e, and it has a caseworker assigned")
  fun `create the assigned referral`() {
    setupAssistant.createAssignedReferral(id = UUID.fromString("2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e"))
  }

  @State("There is an existing referral with ID of 351e7f35-6399-43df-b615-cb41d5ba3e14 which has been ended containing a cancellation reason and comment")
  fun `create an ended referral`() {
    var endedReferral = setupAssistant.createEndedReferral(id = UUID.fromString("351e7f35-6399-43df-b615-cb41d5ba3e14"), cancellationComments = "Alex was arrested for driving without insurance and immediately recalled")
    setupAssistant.fillReferralFields(endedReferral)
  }

  @State(
    "There is an existing sent referral with ID of 400be4c6-1aa4-4f52-ae86-cbd5d23309bf",
    "There are some existing sent referrals sent to HARMONY_LIVING",
    "There are some existing sent referrals sent by user with id 'bernard.beaks'",
  )
  fun `create sent referral 400be4c6`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("400be4c6-1aa4-4f52-ae86-cbd5d23309bf"))
    setupAssistant.fillReferralFields(referral)
  }

  @State("There is an existing draft referral with ID of ac386c25-52c8-41fa-9213-fcf42e24b0b5")
  fun `create referral with the required id`() {
    setupAssistant.createDraftReferral(id = UUID.fromString("ac386c25-52c8-41fa-9213-fcf42e24b0b5"))
  }

  @State(
    "a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists",
    "a single referral for user with ID 8751622134 exists"
  )
  fun `create a new draft referral for 'deliusUser' with a specific createdAt timestamp and CRN`() {
    setupAssistant.createDraftReferral(
      id = UUID.fromString("dfb64747-f658-40e0-a827-87b4b0bdcfed"),
      createdAt = OffsetDateTime.parse("2020-12-07T20:45:21.986389+00:00"),
      serviceUserCRN = "X862134"
    )
  }

  @State(
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962",
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected",
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service provider selected",
  )
  fun `create a new draft referral with accommodation service category and 'HARMONY_LIVING' service provider set (both defaults)`() {
    setupAssistant.createDraftReferral(id = UUID.fromString("d496e4a7-7cc1-44ea-ba67-c295084f1962"))
  }

  @State("There is an existing draft referral with ID of 037cc90b-beaa-4a32-9ab7-7f79136e1d27, and it has had desired outcomes selected")
  fun `create a new draft referral and with desired outcomes`() {
    val intervention = setupAssistant.createIntervention()
    val desiredOutcomes = setupAssistant.desiredOutcomesForServiceCategory(intervention.dynamicFrameworkContract.serviceCategory.id)
    val referral = setupAssistant.createDraftReferral(id = UUID.fromString("037cc90b-beaa-4a32-9ab7-7f79136e1d27"))
    setupAssistant.fillReferralFields(referral, desiredOutcomes = desiredOutcomes)
  }

  @State("There is an existing draft referral with ID of 1219a064-709b-4b6c-a11e-10b8cb3966f6, and it has had a service user selected")
  fun `create a new draft referral with the service user data expected`() {
    val referral = setupAssistant.createDraftReferral(id = UUID.fromString("1219a064-709b-4b6c-a11e-10b8cb3966f6"))
    setupAssistant.fillReferralFields(referral)
  }

  @State("a referral does not exist for user with ID 123344556")
  fun `no setup required`() {}

  @State("There is an existing sent referral with ID of 81d754aa-d868-4347-9c0f-50690773014e")
  fun `create sent referral 81d754aa`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("81d754aa-d868-4347-9c0f-50690773014e"))
    setupAssistant.fillReferralFields(referral)
  }

  @State("a draft referral with ID 2a67075a-9c77-4103-9de0-63c4cfe3e8d6 exists and is ready to be sent")
  fun `create referral with 2a67075a id`() {
    val referral = setupAssistant.createDraftReferral(id = UUID.fromString("2a67075a-9c77-4103-9de0-63c4cfe3e8d6"))
    setupAssistant.fillReferralFields(referral)
  }
}
