# Working with CronJobs

## Running a job ad-hoc

Run the CronJob as a one-off job with:

```
kubectl create job --from=cronjob/{name} "{any name for the one-off job}" --namespace=hmpps-interventions-{yournamespace}
```

For example:

```
kubectl create job --from=cronjob.batch/data-extractor-reporting data-extractor-reporting-once --namespace=hmpps-interventions-preprod
```

📋 This command may need `kubectl` 1.19 to work (as the server is only 1.18 at the moment)
