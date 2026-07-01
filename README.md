# Healthy Life ERP

This repository mirrors the ERP project created in AppDeploy.

## Live links

- Landing page: https://da576bb73e987a3493.v2.appdeploy.ai/
- Admin page: https://da576bb73e987a3493.v2.appdeploy.ai/#admin

## AppDeploy source

- AppDeploy app id: `da576bb73e987a3493`
- AppDeploy version: `1782800601108`
- Architecture: React/Vite frontend + AppDeploy backend

## Important backend note

The live backend uses AppDeploy-specific SDK services: `@appdeploy/sdk`, AppDeploy database, and AppDeploy secrets. This source is therefore meant as a GitHub mirror/reference unless the backend is later converted to a normal Node/Express database stack.

## Secrets

Do not hardcode ERP passwords or API keys in GitHub. Configure these in AppDeploy secrets:

- `ERP_ADMIN_PASSWORD`
- `ERP_CALLCENTER_PASSWORD`
- `RESEND_API_KEY` optional for email notifications
