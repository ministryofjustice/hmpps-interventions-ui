package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.IntegrationTestBase
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

class DraftReferralTest : IntegrationTestBase() {

  @Test
  fun `empty input cannot create draft referral`() {
    assertThrows<RuntimeException> {
      DraftReferral(Referral())
    }
  }

  @Test
  fun `empty referral id cannot create draft referral`() {
    val createdDate = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")

    assertThrows<RuntimeException> {
      DraftReferral(Referral(created = createdDate))
    }
  }

  @Test
  fun `empty referral creation date cannot create draft referral`() {
    val id = UUID.fromString("70d3a47c-d539-4f76-8fc9-1c50e34aea29")

    assertThrows<RuntimeException> {
      DraftReferral(Referral(id = id))
    }
  }

  @Test
  fun `create draft referral dto from referral`() {
    val createdDate = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val id = UUID.fromString("70d3a47c-d539-4f76-8fc9-1c50e34aea29")
    val draftReferral = DraftReferral(Referral(id = id, created = createdDate))

    assertThat(draftReferral.id).isEqualTo("70d3a47c-d539-4f76-8fc9-1c50e34aea29")
    assertThat(draftReferral.created).isEqualTo("2020-12-04T10:42:43Z")
  }

  @Test
  fun `determine json for draft referral dto`() {
    val uuid = "70d3a47c-d539-4f76-8fc9-1c50e34aea29"
    val draftReferralJson =
      """{
        "id":"$uuid",
        "created":"2020-12-04T10:42:43Z"
      }"""

    val mapper = jacksonObjectMapper()

    val draftReferral = DraftReferral(
      Referral(
        id = UUID.fromString(uuid),
        created = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
        completionDeadline = LocalDate.parse("2021-10-05")
      )
    )
    val serializedDraftReferral = mapper.writeValueAsString(draftReferral)

    assertThat(serializedDraftReferral).isEqualToIgnoringWhitespace(draftReferralJson)
  }
}
