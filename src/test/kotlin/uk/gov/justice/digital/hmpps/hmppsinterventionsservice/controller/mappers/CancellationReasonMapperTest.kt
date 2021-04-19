package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CancellationReasonFactory
import java.util.Optional.empty
import java.util.Optional.of

class CancellationReasonMapperTest {

  private val cancellationReasonRepository = mock<CancellationReasonRepository>()
  private val cancellationReasonFactory = CancellationReasonFactory()

  private val cancellationReasonMapper = CancellationReasonMapper(cancellationReasonRepository)

  @Test
  fun `converts cancellation reason id into cancellation Reason object`() {
    val cancellationReason = cancellationReasonFactory.create()
    whenever(cancellationReasonRepository.findById(any())).thenReturn(of(cancellationReason))
    val response = cancellationReasonMapper.mapCancellationReasonIdToCancellationReason("aaa")
    assertThat(response).isEqualTo(cancellationReason)
  }

  @Test
  fun `not found error thrown when no cancellation reason is found`() {
    whenever(cancellationReasonRepository.findById(any())).thenReturn(empty())
    val exception = assertThrows<ResponseStatusException> {
      cancellationReasonMapper.mapCancellationReasonIdToCancellationReason("aaa")
    }
    assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
  }
}
