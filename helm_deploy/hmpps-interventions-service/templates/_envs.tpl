    {{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: SERVER_PORT
    value: "{{ .Values.image.port }}"

  - name: JAVA_OPTS
    value: "{{ .Values.env.JAVA_OPTS }}"

  - name: SPRING_PROFILES_ACTIVE
    value: "logstash"

  - name: HMPPSAUTH_BASEURL
    value: "{{ .Values.env.HMPPSAUTH_BASEURL }}"

  - name: INTERVENTIONSUI_BASEURL
    value: "{{ .Values.env.INTERVENTIONSUI_BASEURL }}"

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

{{- end -}}
