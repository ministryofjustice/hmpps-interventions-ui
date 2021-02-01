package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.web.server.ServerWebInputException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.createJwtAuthenticationToken
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceCategoryService
import java.util.UUID
import javax.persistence.EntityNotFoundException

internal class ReferralControllerTest {
  private val referralService = mock<ReferralService>()
  private val serviceCategoryService = mock<ServiceCategoryService>()
  private val referralController = ReferralController(referralService, serviceCategoryService)

  @Test
  fun `createDraftReferral handles EntityNotFound exceptions from InterventionsService`() {
    whenever(referralService.createDraftReferral(any(), any(), any())).thenThrow(EntityNotFoundException::class.java)
    assertThrows<ServerWebInputException> {
      referralController.createDraftReferral(CreateReferralRequestDTO("CRN20", UUID.randomUUID()), createJwtAuthenticationToken())
    }
  }
}
