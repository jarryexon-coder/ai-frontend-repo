#!/bin/bash

#================================================================================
# This is a script to automate the setup of Google Cloud service account and 
# credentials, required for integrating your Google Play app with RevenueCat.
#================================================================================

# Found in Google Cloud Console -> Project Overview -> Project ID
PROJECT_ID="ai-fantasy-assistant-aa2f6"

# The name of the service account to create. You don't need to change this.
SERVICE_ACCOUNT_NAME="revenuecat-service-account"

# The name of the key file to create in this Cloud Console shell instance.
KEY_FILE_NAME="revenuecat-key"

#================================================================================

set -e # Exit on error

echo "🔎 Starting Google Cloud setup for RevenueCat integration..."

# Check if the PROJECT_ID has been updated
if [ "$PROJECT_ID" == "your_google_cloud_project_id" ]; then
  echo "🚨 PROJECT_ID is set to the default value. Please update it."
  exit 1
fi

echo "Switching to project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable APIs
echo "Enabling APIs needed for service account automation..."
gcloud services enable cloudresourcemanager.googleapis.com
sleep 2
gcloud services enable iam.googleapis.com
sleep 2

echo "Enabling RevenueCat required APIs..."
gcloud services enable androidpublisher.googleapis.com
sleep 2
gcloud services enable playdeveloperreporting.googleapis.com  
sleep 2
gcloud services enable pubsub.googleapis.com
echo "✅ APIs enabled successfully."

# Create Service Account
echo "Creating service account: $SERVICE_ACCOUNT_NAME"
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --description="Service account for RevenueCat integration" \
  --display-name="RevenueCat Service Account"
echo "✅ Service account created successfully."

echo "Waiting 30s for service account to be available..."
sleep 30

# Grant Roles
echo "Granting roles to the service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.editor"
echo "✅ Pub/Sub Editor role assigned."

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/monitoring.viewer"
echo "✅ Monitoring Viewer role assigned."

# Create Service Account Key
echo "Generating service account key..."
gcloud iam service-accounts keys create $KEY_FILE_NAME.json \
  --iam-account="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "✅ Service account key created: $KEY_FILE_NAME.json"
echo "Keep this key safe and upload it to RevenueCat in your Project Settings > Google Play App Settings > Service Account Key."

# Final Confirmation
echo "Verifying service account and key details..."
gcloud iam service-accounts list | grep $SERVICE_ACCOUNT_NAME

echo "Listing keys for the service account..."
gcloud iam service-accounts keys list \
  --iam-account="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "🎉 Setup complete! Upload the file '$KEY_FILE_NAME.json' to RevenueCat."
