package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData

internal class ActionPlanSessionsDTOTest {

  @Test
  fun `Maps from a session`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    val sessionDTO = ActionPlanSessionDTO.from(actionPlanSession)

    assertThat(sessionDTO.id).isEqualTo(actionPlanSession.id)
    assertThat(sessionDTO.sessionNumber).isEqualTo(actionPlanSession.sessionNumber)
    assertThat(sessionDTO.appointmentTime).isEqualTo(actionPlanSession.appointmentTime)
    assertThat(sessionDTO.durationInMinutes).isEqualTo(actionPlanSession.durationInMinutes)
    assertThat(sessionDTO.createdAt).isEqualTo(actionPlanSession.createdAt)
    assertThat(sessionDTO.createdBy.userId).isEqualTo(actionPlanSession.createdBy.id)
  }

  @Test
  fun `Maps from a list of sessions`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    val sessionsDTO = ActionPlanSessionDTO.from(listOf(actionPlanSession))

    assertThat(sessionsDTO.size).isEqualTo(1)
    assertThat(sessionsDTO.first().id).isEqualTo(actionPlanSession.id)
    assertThat(sessionsDTO.first().sessionNumber).isEqualTo(actionPlanSession.sessionNumber)
    assertThat(sessionsDTO.first().appointmentTime).isEqualTo(actionPlanSession.appointmentTime)
    assertThat(sessionsDTO.first().durationInMinutes).isEqualTo(actionPlanSession.durationInMinutes)
    assertThat(sessionsDTO.first().createdAt).isEqualTo(actionPlanSession.createdAt)
    assertThat(sessionsDTO.first().createdBy.userId).isEqualTo(actionPlanSession.createdBy.id)
  }
}
