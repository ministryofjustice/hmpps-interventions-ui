#!/bin/bash -e
curl -X POST "$SLACK_WEBHOOK" \
  --data-urlencode "payload={\"text\":\":wave: Stats to date on $ENVIRONMENT :scienceparrot:\`\`\`$(<"$1")\`\`\`\"}"
