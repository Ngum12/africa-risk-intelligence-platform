# Deploying to IBM Cloud

This guide walks through deploying the Africa Risk Intelligence Platform to IBM Cloud using their free tier services.

## Prerequisites

1. [IBM Cloud account](https://cloud.ibm.com/registration) (Free tier available)
2. [IBM Cloud CLI](https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli)
3. Code Engine plugin: `ibmcloud plugin install code-engine`
4. Docker installed locally

## Deployment Steps

### 1. Login to IBM Cloud

```bash
ibmcloud login