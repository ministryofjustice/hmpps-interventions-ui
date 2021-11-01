package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.net.URI

data class S3Bucket(val enabled: Boolean, val bucketName: String, val client: S3Client)

data class S3BucketConfiguration(
  val enabled: Boolean,
  val provider: String,
  val region: String,
  val accessKeyId: String,
  val secretAccessKey: String,
  val endpoint: Endpoint,
  val bucket: Bucket,
) {
  data class Endpoint(
    val uri: String
  )

  data class Bucket(
    val name: String
  )
}

@ConstructorBinding
@ConfigurationProperties(prefix = "aws.s3")
class S3Buckets(
  val storage: S3BucketConfiguration,
  val ndmis: S3BucketConfiguration,
)

@Configuration
@EnableConfigurationProperties(S3Buckets::class)
class S3Configuration(
  private val buckets: S3Buckets,
) {
  @Bean
  fun storageS3Bucket(): S3Bucket {
    return bucketFactory(buckets.storage)
  }

  @Bean
  fun ndmisS3Bucket(): S3Bucket {
    return bucketFactory(buckets.ndmis)
  }

  private fun bucketFactory(config: S3BucketConfiguration): S3Bucket {
    val builder = S3Client.builder()
      .region(Region.of(config.region))
      .credentialsProvider { AwsBasicCredentials.create(config.accessKeyId, config.secretAccessKey) }

    val client = when (config.provider) {
      "aws" -> builder.build()
      "localstack" ->
        builder
          .endpointOverride(URI.create(config.endpoint.uri))
          .build()
      else -> throw RuntimeException("invalid S3 configuration")
    }

    return S3Bucket(config.enabled, config.bucket.name, client)
  }
}
