package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.Objects
import javax.persistence.Entity
import javax.persistence.Id
import javax.validation.constraints.NotNull

@Entity
data class AuthUser(
  @Id @NotNull val id: String,
  @NotNull val authSource: String,
  @NotNull val userName: String,
  var deleted: Boolean? = null,
) {
  // Normally a user with a hmpps-auth Id represents a unique user. However, hmpps-auth has returned the same
  // user with two different ids. To deal with this temporary issue, username is now being used for equality
  // checking, e.g. don't email user if they are both the sender and assignee of a referral, as determined by user name.
  override fun hashCode() = Objects.hash(userName, authSource)

  override fun equals(other: Any?): Boolean {
    if (other == null || other !is AuthUser) {
      return false
    }

    return userName == other.userName && authSource == other.authSource
  }
  companion object {
    // System user to represent the actor for events that are automatically generated
    val interventionsServiceUser = AuthUser("00000000-0000-0000-0000-000000000000", "fake", "hmpps-interventions-service")
  }
}
