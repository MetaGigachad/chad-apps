# 🗿 Chad Apps

This repository contains implementation of [onboarding](#-onboarding-app) and [training](#-training-app) apps with [Single Sign-On](#-auth-app-for-single-sign-on-sso).

You can use those apps at [onboarding.metachad.mooo.com](https://onboarding.metachad.mooo.com) and [training.metachad.mooo.com](https://training.metachad.mooo.com).

### 🔒 Auth App for Single Sign-On (SSO)

In [auth_frontend](./auth_frontend) and [auth_service](./auth_service) you can find an 
implementation of *Auth App*. It integrates with [Ory Hydra](https://www.ory.sh/hydra/) 
(OAuth2 server) and is responsible for logic of checking the identity. External API for
apps to use is provided by **Hydra**.

### 🎓 Onboarding App

This is an app that allows you to create onboarding plans and deploy them to users 
through telegram bot. Implementation can be found in 
[onboarding_frontend](./onboarding_frontend) and [onboarding_service](./onboarding_service).

### 🦾 Training App

This is an app for tracking you physical training: create workouts, complete them, explore
your achievements. Implementation can be found in
[training_frontend](./training_frontend) and [training_service](./training_service).

### 🔨 Build

You can build docker image of any node by running `make build_{service_name}` in `./deploy`
directory, or you can build every service locally by following corresponding instructions.

### 🚀 Deploy

There is a ready to deploy configuration in [deploy/k8s](./deploy/k8s).
Make `values.yaml` file in [chad-apps-chart](./deploy/k8s/chad-apps-chart),
which you should base of `values-example.yaml`. Currently you may also need
to check files in [values](./deploy/k8s/values), they may contain passwords
from main values that need to be written in. After that use `helmfile apply .`
to install charts.

If you are using `minikube` you will need and `ingress` addon enabled.

### ✅ Plans for future

1. Implement Accounts App to provide more data about user and control it. It would be
   provided to apps throgh OpenID identity.
