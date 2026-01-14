#!/bin/bash
echo "=== Fixing Duplicate GoogleService-Info.plist ==="

# Backup the project file
PROJECT_PATH="ios/NBAFantasyApp.xcodeproj/project.pbxproj"
BACKUP_PATH="$PROJECT_PATH.backup_$(date +%Y%m%d_%H%M%S)"
cp "$PROJECT_PATH" "$BACKUP_PATH"
echo "Backup created: $BACKUP_PATH"

# Check current duplicates
echo ""
echo "Current GoogleService-Info.plist references:"
grep -n "GoogleService-Info.plist" "$PROJECT_PATH"

echo ""
echo "Removing duplicate entries..."

# Create temp file
TEMP_FILE="$PROJECT_PATH.temp"

# Process the file to remove duplicates
# This awk script keeps only one file reference and one build file
awk '
BEGIN { in_resources = 0; plist_count = 0; buildfile_count = 0; }

# Track when we are in the resources section
/\/\* Resources \*\// { in_resources = 1; print $0; next }
/\/\* [^*]+\*\// { in_resources = 0; }

# Handle file references (keep first one only)
/GoogleService-Info.plist.*=.*PBXFileReference/ {
    if (plist_count == 0) {
        print $0
        plist_count++
    }
    next
}

# Handle build files in resources section (keep first one only)
/GoogleService-Info.plist.*in Resources.*=.*PBXBuildFile/ {
    if (in_resources && buildfile_count == 0) {
        print $0
        buildfile_count++
    }
    next
}

# Print all other lines
{ print $0 }
' "$PROJECT_PATH" > "$TEMP_FILE"

# Replace the original file
mv "$TEMP_FILE" "$PROJECT_PATH"

echo ""
echo "Fixed! Remaining references:"
grep -n "GoogleService-Info.plist" "$PROJECT_PATH"
echo ""
echo "=== Done ==="
