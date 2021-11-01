#!/bin/bash
set -x
awslocal s3 mb s3://interventions-bucket-local
set +x