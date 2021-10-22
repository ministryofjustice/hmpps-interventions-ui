package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory

internal class ClientApiAccessCheckerTest {

  private val tokenFactory = JwtTokenFactory()

  private val accessChecker = ClientApiAccessChecker()

  @Test
  fun `getSentReferral returns a sent referral to a client api request`() {

    assertThat(
      accessChecker.isClientRequestWithReadAllRole(
        tokenFactory.create(
          clientId = "interventions-event-client",
          subject = "interventions-event-client",
          authorities = arrayOf("ROLE_INTERVENTIONS_API_READ_ALL")
        ),
      )
    ).isTrue
  }

  @Test
  fun `getSentReferral does not return a sent referral to a client api request when client id and subject do not match`() {

    assertThat(
      accessChecker.isClientRequestWithReadAllRole(
        tokenFactory.create(
          clientId = "interventions-event-client",
          subject = "BERNARD.BERKS",
          authorities = arrayOf("ROLE_INTERVENTIONS_API_READ_ALL")
        ),
      )
    ).isFalse
  }

  @Test
  fun `getSentReferral does not return a sent referral to a client api request without the required authority`() {

    assertThat(
      accessChecker.isClientRequestWithReadAllRole(
        tokenFactory.create(
          clientId = "interventions-event-client",
          subject = "interventions-event-client",
          authorities = arrayOf("ROLE_INTEXXXXTIONS_API_READ_ALL")
        ),
      )
    ).isFalse
  }
}
