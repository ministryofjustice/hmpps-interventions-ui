package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.model.ObjectCannedACL
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.S3Bucket
import java.nio.file.Path

@Service
class S3Service {
  companion object : KLogging()

  fun publishFileToS3(bucket: S3Bucket, path: Path, keyPrefix: String = "", acl: ObjectCannedACL? = null) {
    if (!bucket.enabled) {
      logger.info("not publishing to s3; s3 disabled")
      return
    }

    val key = "${keyPrefix}${path.fileName}"
    logger.info("publishing file to s3 {}", StructuredArguments.kv("key", key))

    val objectRequest = PutObjectRequest.builder()
      .bucket(bucket.bucketName)
      .key(key)
      .apply { acl?.let { acl(it) } }
      .build()

    bucket.client.putObject(objectRequest, RequestBody.fromFile(path))
  }
}
