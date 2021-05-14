package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.server.ServerWebInputException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.CancellationReasonMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AuthUserDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ReferralAssignmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceCategoryService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.util.UUID
import javax.persistence.EntityNotFoundException

internal class ReferralControllerTest {
  private val referralService = mock<ReferralService>()
  private val serviceCategoryService = mock<ServiceCategoryService>()
  private val hmppsAuthService = mock<HMPPSAuthService>()
  private val userMapper = UserMapper()
  private val cancellationReasonMapper = mock<CancellationReasonMapper>()
  private val referralController = ReferralController(
    referralService, serviceCategoryService, hmppsAuthService,
    userMapper, cancellationReasonMapper
  )
  private val tokenFactory = JwtTokenFactory()
  private val referralFactory = ReferralFactory()
  private val userFactory = AuthUserFactory()

  @Nested
  inner class GetReferral {
    @Test
    fun `getReferral returns Referral response if referral exists`() {
      val referral = referralFactory.createDraft()
      whenever(referralService.getReferral(eq(referral.id))).thenReturn(referral)
      val referralDTO = referralController.getReferral(referral.id)
      assertThat(referralDTO).isNotNull()
    }

    @Test
    fun `getReferral throws NotFound response if referral doesn't exist`() {
      whenever(referralService.getReferral(any())).thenReturn(null)
      val e = assertThrows<ResponseStatusException> {
        referralController.getReferral(UUID.randomUUID())
      }
      assertThat(e.status).isEqualTo(HttpStatus.NOT_FOUND)
    }
  }

  @Test
  fun `createDraftReferral handles EntityNotFound exceptions from InterventionsService`() {
    whenever(referralService.createDraftReferral(any(), any(), any(), anyOrNull(), anyOrNull(), anyOrNull())).thenThrow(EntityNotFoundException::class.java)
    assertThrows<ServerWebInputException> {
      referralController.createDraftReferral(CreateReferralRequestDTO("CRN20", UUID.randomUUID()), tokenFactory.create())
    }
  }

  @Test
  fun `getSentReferrals filters by service provider organization from query param`() {
    referralController.getSentReferrals(sentTo = "HARMONY_LIVING")
    verify(referralService).getSentReferralsForServiceProviderID("HARMONY_LIVING")
  }

  @Test
  fun `getSentReferrals filters by PP from query param`() {
    referralController.getSentReferrals(sentBy = "bernard.beaks")
    verify(referralService).getSentReferralsSentBy("bernard.beaks")
  }

  @Test
  fun `getSentReferrals filters by assignee from query param`() {
    referralController.getSentReferrals(assignedTo = "someone@provider.com")
    verify(referralService).getSentReferralsAssignedTo("someone@provider.com")
  }

  @Test
  fun `getSentReferrals throws error unless a single query param is passed`() {
    assertThrows<ServerWebInputException> {
      referralController.getSentReferrals()
    }

    assertThrows<ServerWebInputException> {
      referralController.getSentReferrals(sentBy = "bernard.beaks", sentTo = "HARMONY_LIVING")
    }
  }

  @Test
  fun `assignSentReferral returns 404 if referral does not exist`() {
    whenever(referralService.getSentReferral(any())).thenReturn(null)
    val e = assertThrows<ResponseStatusException> {
      referralController.assignSentReferral(
        UUID.randomUUID(),
        ReferralAssignmentDTO(AuthUserDTO("username", "authSource", "userId")),
        tokenFactory.create()
      )
    }
    assertThat(e.status).isEqualTo(HttpStatus.NOT_FOUND)
  }

  @Test
  fun `assignSentReferral uses incoming jwt for 'assignedBy' argument, and request body for 'assignedTo'`() {
    val referral = referralFactory.createSent()
    val assignedToUser = userFactory.create(id = "to")
    whenever(referralService.getSentReferral(any())).thenReturn(referral)
    whenever(referralService.assignSentReferral(any(), any(), any())).thenReturn(referral)
    referralController.assignSentReferral(
      UUID.randomUUID(),
      ReferralAssignmentDTO(AuthUserDTO.from(assignedToUser)),
      tokenFactory.create(userID = "by")
    )

    val toCaptor = argumentCaptor<AuthUser>()
    val byCaptor = argumentCaptor<AuthUser>()
    verify(referralService).assignSentReferral(eq(referral), byCaptor.capture(), toCaptor.capture())
    assertThat(toCaptor.firstValue.id).isEqualTo("to")
    assertThat(byCaptor.firstValue.id).isEqualTo("by")
  }

  @Test
  fun `successfully call end referral endpoint`() {
    val referral = referralFactory.createSent()
    val endReferralDTO = EndReferralRequestDTO("AAA", "comment")
    val cancellationReason = CancellationReason("AAA", "description")

    whenever(cancellationReasonMapper.mapCancellationReasonIdToCancellationReason(any())).thenReturn(cancellationReason)
    whenever(referralService.getSentReferral(any())).thenReturn(referral)

    val user = AuthUser("CRN123", "auth", "user")
    val token = tokenFactory.create(user.id, user.authSource, user.userName)
    whenever(referralService.requestReferralEnd(any(), any(), any(), any())).thenReturn(referralFactory.createEnded(endRequestedComments = "comment"))

    referralController.endSentReferral(referral.id, endReferralDTO, token)
    verify(referralService).requestReferralEnd(referral, user, cancellationReason, "comment")
  }

  @Test
  fun `end referral endpoint does not find referral`() {
    val endReferralDTO = EndReferralRequestDTO("AAA", "comment")
    val cancellationReason = CancellationReason("AAA", "description")

    whenever(cancellationReasonMapper.mapCancellationReasonIdToCancellationReason(any())).thenReturn(cancellationReason)

    whenever(referralService.getSentReferral(any())).thenReturn(null)
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())
    val e = assertThrows<ResponseStatusException> {
      referralController.endSentReferral(UUID.randomUUID(), endReferralDTO, jwtAuthenticationToken)
    }
    assertThat(e.status).isEqualTo(HttpStatus.NOT_FOUND)
  }

  @Test
  fun `get all cancellation reasons`() {
    val cancellationReasons = listOf(
      CancellationReason(code = "aaa", description = "reason 1"),
      CancellationReason(code = "bbb", description = "reason 2")
    )
    whenever(referralService.getCancellationReasons()).thenReturn(cancellationReasons)
    val response = referralController.getCancellationReasons()
    assertThat(response).isEqualTo(cancellationReasons)
  }
}
