{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: INGRESS_URL
    value: "https://{{ .Values.ingress.host }}"

  - name: API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-ui-client-id.txt

  - name: API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-ui-client-secret.txt

  - name: LOGIN_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-login-client-id.txt

  - name: LOGIN_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-login-client-secret.txt

  - name: SESSION_SECRET
    valueFrom:
      secretKeyRef:
        name: session
        key: interventions-ui-session-secret.txt

  - name: REDIS_HOST
    valueFrom:
      secretKeyRef:
        name: elasticache-redis
        key: primary_endpoint_address

  - name: REDIS_AUTH_TOKEN
    valueFrom:
      secretKeyRef:
        name: elasticache-redis
        key: auth_token

  - name: SENTRY_DSN
    valueFrom:
      secretKeyRef:
        name: sentry
        key: ui_dsn

  - name: APPLICATIONINSIGHTS_CONNECTION_STRING
    valueFrom:
      secretKeyRef:
        name: application-insights
        key: connection_string

  {{ range $key, $value := .Values.env }}
  - name: {{ $key }}
    value: {{ $value | quote }}
  {{ end }}

  - name: NODE_ENV
    value: production

{{- end -}}
