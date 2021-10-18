package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import java.time.OffsetDateTime
import java.util.UUID

class ReferralContracts(private val setupAssistant: SetupAssistant) {
  @State("There is an existing sent referral with ID of 2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e, and it has a caseworker assigned")
  fun `create the assigned referral`() {
    setupAssistant.createAssignedReferral(id = UUID.fromString("2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e"))
  }

  @State("There is an existing sent referral with ID of c5554f8f-aac6-4eaf-ba70-63281de35685, and it has been requested to be ended")
  fun `create a referral with an end request`() {
    val referral = setupAssistant.createEndedReferral(
      id = UUID.fromString("c5554f8f-aac6-4eaf-ba70-63281de35685"),
      endRequestedComments = "Alex was arrested for driving without insurance and immediately recalled",
    )
    setupAssistant.fillReferralFields(referral)
  }

  @State("There is an existing referral with ID of 351e7f35-6399-43df-b615-cb41d5ba3e14 which has been ended containing a cancellation reason and comment")
  fun `create an ended referral`() {
    var endedReferral = setupAssistant.createEndedReferral(
      id = UUID.fromString("351e7f35-6399-43df-b615-cb41d5ba3e14"),
      endRequestedComments = "Alex was arrested for driving without insurance and immediately recalled",
    )
    setupAssistant.fillReferralFields(endedReferral)
  }

  @State("There is an existing assigned referral with ID of 5f71c68f-3e43-46b6-8f25-027a88637ee1 with no attended sessions")
  fun `create an assigned referral with no action plan`() {
    val referral = setupAssistant.createAssignedReferral(id = UUID.fromString("5f71c68f-3e43-46b6-8f25-027a88637ee1"))
    setupAssistant.fillReferralFields(referral)
  }

  @State("There is a sent referral with ID 4afb07a0-e50b-490c-a8c1-c858d5a1e912 with an assigned user")
  fun `create a sent referral with ID 4afb07a0-e50b-490c-a8c1-c858d5a1e912 with an assigned user`() {
    setupAssistant.createAssignedReferral(
      id = UUID.fromString("4afb07a0-e50b-490c-a8c1-c858d5a1e912"),
      interventionTitle = "Accommodation Services - West Midlands",
      serviceProviderId = "HAPPY_LIVING",
      sentAt = OffsetDateTime.parse("2021-01-26T13:00:00.000000Z"),
      referenceNumber = "ABCABCA1",
      assignedToUsername = "bernard.beaks",
      serviceUserFirstName = "George",
      serviceUserLastName = "Michael",
    )
  }

  @State("There is a sent referral with ID dc94fbd6-354b-4edc-863b-cffc8358f1ec without an assigned user")
  fun `create a sent referral with ID dc94fbd6-354b-4edc-863b-cffc8358f1ec without an assigned user`() {
    setupAssistant.createAssignedReferral(
      id = UUID.fromString("dc94fbd6-354b-4edc-863b-cffc8358f1ec"),
      interventionTitle = "Accommodation Services - West Midlands",
      serviceProviderId = "HAPPY_LIVING",
      sentAt = OffsetDateTime.parse("2021-01-26T13:00:00.000000Z"),
      referenceNumber = "ABCABCA1",
      serviceUserFirstName = "George",
      serviceUserLastName = "Michael",
    )
  }

  @State(
    "There is an existing sent referral with ID of 400be4c6-1aa4-4f52-ae86-cbd5d23309bf and it is unassigned",
    "There are some existing sent referrals sent by a probation practitioner user",
  )
  fun `create sent referral 400be4c6`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("400be4c6-1aa4-4f52-ae86-cbd5d23309bf"))
    setupAssistant.fillReferralFields(referral)
  }

  @State("There are some sent referrals in various states of completion for probation practitioner user")
  fun `create several sent referrals of varing states of completion`() {
    // assigned
    setupAssistant.createAssignedReferral(id = UUID.fromString("4b56a623-2f85-4670-87a7-68d458378646"))

    // unassigned
    setupAssistant.createSentReferral(id = UUID.fromString("995b30f5-182d-4409-aed9-0f3f4ae56802"))

    // concluded
    setupAssistant.createCompletedReferral(id = UUID.fromString("eb25cf36-4956-4924-a887-989fe3d6638d"))

    // cancelled
    setupAssistant.createCancelledReferral(id = UUID.fromString("bfabb659-1200-4479-bae7-8927e1e87a0d"))
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
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962 with contract type of womens services",
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected",
    "There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service provider selected",
  )
  fun `create a new draft referral with women's service type and 'HARMONY_LIVING' service provider`() {
    val contract = setupAssistant.createDynamicFrameworkContract(contractType = setupAssistant.contractTypes["WOS"]!!, primeProviderId = "HARMONY_LIVING")
    val intervention = setupAssistant.createIntervention(dynamicFrameworkContract = contract)
    setupAssistant.createDraftReferral(
      id = UUID.fromString("d496e4a7-7cc1-44ea-ba67-c295084f1962"), intervention = intervention,
      selectedServiceCategories = mutableSetOf(setupAssistant.serviceCategory(UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16")))
    )
  }

  @State(
    "There is an existing draft referral with ID of 037cc90b-beaa-4a32-9ab7-7f79136e1d27, and it has had desired outcomes selected",
    "There is an existing draft referral with ID of 037cc90b-beaa-4a32-9ab7-7f79136e1d27, and it has had a complexity level selected",
  )
  fun `create a new draft referral and with desired outcomes and complexity level`() {
    val referral = setupAssistant.createDraftReferral(id = UUID.fromString("037cc90b-beaa-4a32-9ab7-7f79136e1d27"))
    setupAssistant.fillReferralFields(referral)
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

  @State(
    "There is an existing draft cohort referral with ID of 06716f8e-f507-42d4-bdcc-44c90e18dbd7, and it has had multiple service categories selected",
    "There is an existing draft cohort referral with ID of 06716f8e-f507-42d4-bdcc-44c90e18dbd7, and it has had desired outcomes selected for multiple service categories",
    "There is an existing draft cohort referral with ID of 06716f8e-f507-42d4-bdcc-44c90e18dbd7, and it has had a complexity level selected for multiple service categories",
  )
  fun `create a draft referral with ID 06716f8e with desired outcomes and service categories`() {
    val contract = setupAssistant.createDynamicFrameworkContract(contractType = setupAssistant.contractTypes["WOS"]!!, primeProviderId = "HARMONY_LIVING")
    val intervention = setupAssistant.createIntervention(dynamicFrameworkContract = contract)
    val referral = setupAssistant.createDraftReferral(id = UUID.fromString("06716f8e-f507-42d4-bdcc-44c90e18dbd7"), intervention = intervention)
    setupAssistant.fillReferralFields(referral)
  }
}
