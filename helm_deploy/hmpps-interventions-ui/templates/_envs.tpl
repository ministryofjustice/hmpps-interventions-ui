{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: INGRESS_URL
    value: "https://{{ .Values.ingress.host }}/"

  - name: API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-ui-client-id

  - name: API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-ui-client-secret

  - name: LOGIN_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-login-client-id

  - name: LOGIN_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: hmpps-auth
        key: interventions-login-client-secret

  - name: SESSION_SECRET
    valueFrom:
      secretKeyRef:
        name: session
        key: interventions-ui-session-secret

  - name: REDIS_HOST
    valueFrom:
      secretKeyRef:
        name: hmpps_template_typescript_elasticache_redis
        key: primary_endpoint_address

  - name: REDIS_AUTH_TOKEN
    valueFrom:
      secretKeyRef:
        name: hmpps_template_typescript_elasticache_redis
        key: auth_token

  - name: REDIS_TLS_ENABLED
    value: {{ .Values.env.REDIS_TLS_ENABLED }}
    value: "true"

  - name: HMPPS_AUTH_URL
    value: {{ .Values.env.HMPPS_AUTH_URL | quote }}

  - name: TOKEN_VERIFICATION_API_URL
    value: {{ .Values.env.TOKEN_VERIFICATION_API_URL | quote }}

  - name: TOKEN_VERIFICATION_ENABLED
    value: {{ .Values.env.TOKEN_VERIFICATION_ENABLED | quote }}

  - name: NODE_ENV
    value: production

{{- end -}}
