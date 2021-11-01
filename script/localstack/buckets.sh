#!/bin/bash
set -x
awslocal s3 mb s3://interventions-bucket-local
awslocal s3 mb s3://ndmis-bucket-local
set +x