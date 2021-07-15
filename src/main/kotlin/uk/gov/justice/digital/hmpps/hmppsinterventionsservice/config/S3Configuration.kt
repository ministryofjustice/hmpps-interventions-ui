package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.net.URI

@Configuration
class S3Configuration(
  @Value("\${aws.s3.provider}") private val provider: String,
  @Value("\${aws.s3.region}") private val region: String,
  @Value("\${aws.s3.access-key-id}") private val accessKeyId: String,
  @Value("\${aws.s3.secret-access-key}") private val secretAccessKey: String,
  @Value("\${aws.s3.endpoint.uri:}") private val uri: String,
) {
  @Bean
  fun s3Client(): S3Client {
    val builder = S3Client.builder()
      .region(Region.of(region))
      .credentialsProvider { AwsBasicCredentials.create(accessKeyId, secretAccessKey) }

    return when (provider) {
      "aws" -> builder.build()
      "localstack" ->
        builder
          .endpointOverride(URI.create(uri))
          .build()
      else -> throw RuntimeException("invalid S3 configuration")
    }
  }
}
