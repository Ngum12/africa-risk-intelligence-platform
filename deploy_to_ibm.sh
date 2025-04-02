#!/bin/bash

# Log in to IBM Cloud (you need to do this manually first time)
# ibmcloud login

# Check if logged in
echo "Checking IBM Cloud login status..."
ibmcloud target

# Set resource group and region
echo "Setting resource group and region..."
ibmcloud target -g Default -r us-south

# Create project if it doesn't exist
echo "Creating Code Engine project if it doesn't exist..."
ibmcloud ce project create --name arip-project || ibmcloud ce project select --name arip-project

# Build and push images to IBM Container Registry
echo "Building and pushing backend image..."
ibmcloud cr namespace-add arip || true
ibmcloud ce build create --name arip-backend-build --source . --context-dir backend --strategy dockerfile --size medium --image us.icr.io/arip/backend:latest

echo "Building and pushing frontend image..."
ibmcloud ce build create --name arip-frontend-build --source . --context-dir frontend --strategy dockerfile --size medium --image us.icr.io/arip/frontend:latest

# Deploy backend application
echo "Deploying backend application..."
ibmcloud ce application create --name arip-backend \
  --image us.icr.io/arip/backend:latest \
  --port 8080 \
  --min-scale 1 \
  --max-scale 3 \
  --cpu 0.5 \
  --memory 1G \
  --env DEBUG=False \
  --env ALLOW_ORIGIN=https://arip-frontend.*.appdomain.cloud

# Deploy frontend application
echo "Deploying frontend application..."
ibmcloud ce application create --name arip-frontend \
  --image us.icr.io/arip/frontend:latest \
  --port 80 \
  --min-scale 1 \
  --max-scale 3 \
  --cpu 0.25 \
  --memory 0.5G \
  --env VITE_API_URL=https://arip-backend.*.appdomain.cloud

# Get application URLs
echo "Deployment complete. Application URLs:"
BACKEND_URL=$(ibmcloud ce application get --name arip-backend -o url)
FRONTEND_URL=$(ibmcloud ce application get --name arip-frontend -o url)

echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"