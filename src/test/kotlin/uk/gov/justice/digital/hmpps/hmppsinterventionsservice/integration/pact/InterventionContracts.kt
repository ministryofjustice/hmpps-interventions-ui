package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScopeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import java.util.UUID

class InterventionContracts(
  private val setupAssistant: SetupAssistant,
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper,
) {
  @State(
    "There is an existing intervention with ID 15237ae5-a017-4de6-a033-abf350f14d99",
    "There are some interventions",
    "There are some PCC regions",
  )
  fun `create an intervention with the known id`() {
    setupAssistant.createIntervention(id = UUID.fromString("15237ae5-a017-4de6-a033-abf350f14d99"))
  }

  @State("an intervention has been selected and a draft referral can be created")
  fun `create an intervention with the requested id`() {
    setupAssistant.createIntervention(id = UUID.fromString("98a42c61-c30f-4beb-8062-04033c376e2d"))
  }

  @State("There are some interventions associated with the default service provider user's access scope")
  fun `create an intervention for the default SP users contract scope`() {
    // the access scope mapper is mocked and the returned contracts are auto generated.
    // extract them here and create interventions for each contract.
    val scope = serviceProviderAccessScopeMapper.fromUser(AuthUser("any", "any", "any"))
    scope.contracts.forEach { setupAssistant.createIntervention(dynamicFrameworkContract = it) }
  }
}
