package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.nio.file.Path

@Service
class S3Service(
  private val s3Client: S3Client,
  @Value("\${aws.s3.enabled}") private val s3Enabled: Boolean,
  @Value("\${aws.s3.bucket.name}") private val s3BucketName: String,
) {
  companion object : KLogging()

  fun publishFileToS3(path: Path, keyPrefix: String = "") {
    if (!s3Enabled) {
      logger.info("not publishing to s3; s3 disabled")
      return
    }

    val key = "${keyPrefix}${path.fileName}"
    logger.info("publishing file to s3 {}", StructuredArguments.kv("key", key))

    val objectRequest = PutObjectRequest.builder()
      .bucket(s3BucketName)
      .key(key)
      .build()

    s3Client.putObject(objectRequest, RequestBody.fromFile(path))
  }
}
