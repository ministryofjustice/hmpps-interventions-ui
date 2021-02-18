package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.server.ServerWebInputException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceCategoryService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import java.util.UUID
import javax.persistence.EntityNotFoundException

internal class ReferralControllerTest {
  private val referralService = mock<ReferralService>()
  private val serviceCategoryService = mock<ServiceCategoryService>()
  private val hmppsAuthService = mock<HMPPSAuthService>()
  private val referralController = ReferralController(referralService, serviceCategoryService, hmppsAuthService)
  private val tokenFactory = JwtTokenFactory()

  @Test
  fun `createDraftReferral handles EntityNotFound exceptions from InterventionsService`() {
    whenever(referralService.createDraftReferral(any(), any(), any(), anyOrNull(), anyOrNull())).thenThrow(EntityNotFoundException::class.java)
    assertThrows<ServerWebInputException> {
      referralController.createDraftReferral(CreateReferralRequestDTO("CRN20", UUID.randomUUID()), tokenFactory.create())
    }
  }

  @Test
  fun `getSentReferrals filters by service provider organization from auth token`() {
    whenever(hmppsAuthService.getServiceProviderOrganizationForUser(any())).thenReturn("HARMONY_LIVING")
    referralController.getSentReferrals(tokenFactory.create())
    verify(referralService).getSentReferralsForServiceProviderID("HARMONY_LIVING")
  }

  @Test
  fun `getSentReferrals throws AccessDeniedException when user is not associated with a service provider`() {
    whenever(hmppsAuthService.getServiceProviderOrganizationForUser(any())).thenReturn(null)
    assertThrows<AccessDeniedException> {
      referralController.getSentReferrals(tokenFactory.create())
    }
  }
}
