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

  - name: REDIS_TLS_ENABLED
    value: {{ .Values.env.REDIS_TLS_ENABLED | quote }}

  - name: HMPPS_AUTH_URL
    value: {{ .Values.env.HMPPS_AUTH_URL | quote }}

  - name: COMMUNITY_API_URL
    value: {{ .Values.env.COMMUNITY_API_URL | quote }}

  - name: INTERVENTIONS_SERVICE_URL
    value: {{ .Values.env.INTERVENTIONS_SERVICE_URL | quote }}

  - name: TOKEN_VERIFICATION_API_URL
    value: {{ .Values.env.TOKEN_VERIFICATION_API_URL | quote }}

  - name: TOKEN_VERIFICATION_ENABLED
    value: {{ .Values.env.TOKEN_VERIFICATION_ENABLED | quote }}

  - name: NODE_ENV
    value: production

{{- end -}}
