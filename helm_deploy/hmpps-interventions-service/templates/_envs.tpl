    {{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: SERVER_PORT
    value: "{{ .Values.image.port }}"

  - name: SPRING_PROFILES_ACTIVE
    value: "{{ .Values.env.SPRING_PROFILES_ACTIVE }}"

  - name: JAVA_OPTS
    value: "{{ .Values.env.JAVA_OPTS }}"

  - name: HMPPSAUTH_BASEURL
    value: "{{ .Values.env.HMPPSAUTH_BASEURL }}"

  - name: INTERVENTIONSUI_BASEURL
    value: "{{ .Values.env.INTERVENTIONSUI_BASEURL }}"

  - name: COMMUNITYAPI_BASEURL
    value: "{{ .Values.env.COMMUNITYAPI_BASEURL }}"

  - name: COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_PROVIDERCODE
    value: "{{ .Values.env.COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_PROVIDERCODE }}"

  - name: COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_REFERRALTYPE
    value: "{{ .Values.env.COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_REFERRALTYPE }}"

  - name: COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_STAFFCODE
    value: "{{ .Values.env.COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_STAFFCODE }}"

  - name: COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_TEAMCODE
    value: "{{ .Values.env.COMMUNITYAPI_CONTACTNOTIFICATIONCONTEXT_TEAMCODE }}"

  - name: APPLICATIONINSIGHTS_CONNECTION_STRING
    valueFrom:
      secretKeyRef:
        name: application-insights
        key: connection_string

  - name: SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_INTERVENTIONSCLIENT_CLIENTID
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-service-client-id.txt

  - name: SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_INTERVENTIONSCLIENT_CLIENTSECRET
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-service-client-secret.txt

  - name: POSTGRES_URI
    valueFrom:
      secretKeyRef:
        name: postgres
        key: rds_instance_endpoint

  - name: POSTGRES_DB
    valueFrom:
      secretKeyRef:
        name: postgres
        key: database_name

  - name: POSTGRES_USERNAME
    valueFrom:
      secretKeyRef:
        name: postgres
        key: database_username

  - name: POSTGRES_PASSWORD
    valueFrom:
      secretKeyRef:
        name: postgres
        key: database_password

  - name: AWS_SNS_ACCESSKEYID
    valueFrom:
      secretKeyRef:
        name: hmpps-domain-events-topic
        key: access_key_id

  - name: AWS_SNS_SECRETACCESSKEY
    valueFrom:
      secretKeyRef:
        name: hmpps-domain-events-topic
        key: secret_access_key

  - name: AWS_SNS_TOPIC_ARN
    valueFrom:
      secretKeyRef:
        name: hmpps-domain-events-topic
        key: topic_arn

  - name: NOTIFY_APIKEY
    valueFrom:
      secretKeyRef:
        name: notify
        key: api_key

{{- end -}}
