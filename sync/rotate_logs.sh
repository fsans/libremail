#!/bin/bash
# LibreMail Log Rotation Script
# This script manages LibreMail log files by removing old logs and compressing older ones
# Recommended usage: Add to crontab to run daily
# Example: 0 0 * * * /path/to/libremail/sync/rotate_logs.sh

# Configuration
LOG_DIR="/Volumes/DATA00/HOME/Documents/WORK/GITHUB/libremail/sync/logs"
MAX_AGE_DAYS=30        # Delete logs older than this many days
COMPRESS_AGE_DAYS=7    # Compress logs older than this many days
MAX_SIZE_MB=100        # Maximum size for any single log file (in MB)

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to check log size and rotate if needed
check_and_rotate_by_size() {
  for log_file in "$LOG_DIR"/*.log; do
    if [ -f "$log_file" ]; then
      # Get file size in KB
      size_kb=$(du -k "$log_file" | cut -f1)
      max_size_kb=$((MAX_SIZE_MB * 1024))
      
      if [ $size_kb -gt $max_size_kb ]; then
        echo "Log file $log_file exceeds maximum size, rotating..."
        timestamp=$(date +"%Y%m%d-%H%M%S")
        mv "$log_file" "${log_file}.${timestamp}"
        touch "$log_file"
        chmod 644 "$log_file"
      fi
    fi
  done
}

# Delete old log files
echo "Removing log files older than $MAX_AGE_DAYS days..."
find "$LOG_DIR" -name "*.log.*" -type f -mtime +$MAX_AGE_DAYS -delete

# Compress log files older than COMPRESS_AGE_DAYS but younger than MAX_AGE_DAYS
echo "Compressing log files older than $COMPRESS_AGE_DAYS days..."
find "$LOG_DIR" -name "*.log.*" -type f -mtime +$COMPRESS_AGE_DAYS -mtime -$MAX_AGE_DAYS -not -name "*.gz" -exec gzip -9 {} \;

# Check current log files for size limits
check_and_rotate_by_size

echo "Log rotation completed successfully."