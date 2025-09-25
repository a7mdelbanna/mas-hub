#!/bin/bash
# Delete all Firebase Auth users for mashub-a0725

# Get all user IDs
USER_IDS=$(gcloud firebase auth users list --project mashub-a0725 --format="value(localId)" 2>/dev/null)

if [ -z "$USER_IDS" ]; then
  echo "No users found"
  exit 0
fi

# Delete each user
while IFS= read -r uid; do
  echo "Deleting user: $uid"
  gcloud firebase auth users delete "$uid" --project mashub-a0725 --quiet
done <<< "$USER_IDS"

echo "All users deleted successfully"
