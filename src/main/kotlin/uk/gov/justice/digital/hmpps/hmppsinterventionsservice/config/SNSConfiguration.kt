package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.sns.SnsClient
import java.net.URI

@Configuration
class SNSConfiguration(
  @Value("\${aws.sns.provider}") private val provider: String,
  @Value("\${aws.sns.region}") private val region: String,
  @Value("\${aws.sns.access-key-id}") private val accessKeyId: String,
  @Value("\${aws.sns.secret-access-key}") private val secretAccessKey: String,
  @Value("\${aws.sns.endpoint.uri:}") private val uri: String,

) {
  @Bean
  fun snsClient(): SnsClient {
    val builder = SnsClient.builder()
      .region(Region.of(region))
      .credentialsProvider { AwsBasicCredentials.create(accessKeyId, secretAccessKey) }

    return when (provider) {
      "aws" -> builder.build()
      "localstack" ->
        builder
          .endpointOverride(URI.create(uri))
          .build()
      else -> throw RuntimeException("invalid SNS configuration")
    }
  }
}
