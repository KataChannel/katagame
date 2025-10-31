#!/bin/bash

# Find and kill all processes running on ports 3000 and 11000
echo "Killing all processes on ports 3000 and 11000..."

# Function to kill all processes on a specific port
kill_port() {
    local PORT=$1
    
    # Method 1: Using lsof
    local PIDS=$(sudo lsof -ti:$PORT 2>/dev/null)
    
    # Method 2: Using ss and extract PIDs (backup method)
    if [ -z "$PIDS" ]; then
        PIDS=$(sudo ss -tulpn | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | sort -u)
    fi
    
    # Method 3: Using fuser (backup method)
    if [ -z "$PIDS" ]; then
        PIDS=$(sudo fuser $PORT/tcp 2>/dev/null)
    fi
    
    if [ ! -z "$PIDS" ]; then
        echo "Found processes on port $PORT: $PIDS"
        for PID in $PIDS; do
            # Show process info before killing
            ps -p $PID -o pid,comm,args 2>/dev/null | tail -n +2
            sudo kill -9 $PID 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "✓ Killed process $PID on port $PORT"
            else
                echo "✗ Failed to kill process $PID"
            fi
        done
        # Wait a bit for processes to terminate
        sleep 1
    else
        echo "No process found on port $PORT"
    fi
}

# Kill all processes on port 3000
kill_port 3000

# Kill all processes on port 11000
kill_port 11000

# Verify ports are free
echo ""
echo "Verifying ports are free..."
REMAINING_3000=$(sudo ss -tulpn | grep ":3000 " | grep -oP 'pid=\K[0-9]+' | sort -u)
REMAINING_11000=$(sudo ss -tulpn | grep ":11000 " | grep -oP 'pid=\K[0-9]+' | sort -u)

if [ -z "$REMAINING_3000" ] && [ -z "$REMAINING_11000" ]; then
    echo "✓ All processes successfully killed. Ports 3000 and 11000 are now free."
else
    echo "⚠ Warning: Some processes may still be running!"
    if [ ! -z "$REMAINING_3000" ]; then
        echo "  - Port 3000 still has PIDs: $REMAINING_3000"
        sudo ss -tulpn | grep ":3000 "
    fi
    if [ ! -z "$REMAINING_11000" ]; then
        echo "  - Port 11000 still has PIDs: $REMAINING_11000"
        sudo ss -tulpn | grep ":11000 "
    fi
fi

echo "Done!"