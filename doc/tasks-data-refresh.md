# Refreshing our data

## Refreshing pre-production from production

Execute the scheduled load job
```
kubectl --namespace=hmpps-interventions-prod \
  create job --from=cronjob.batch/db-refresh-job refresh-job
```

📋 This command may need `kubectl` 1.19 to work (as the server is only 1.18 at the moment)
