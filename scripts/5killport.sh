#!/bin/bash

# Find and kill processes running on ports 11000 and 11001
echo "Killing processes on ports 11000 and 11001..."

# Kill process on port 11000
PID_11000=$(sudo lsof -ti:11000)
if [ ! -z "$PID_11000" ]; then
    sudo kill -9 $PID_11000
    echo "Killed process $PID_11000 on port 11000"
else
    echo "No process found on port 11000"
fi


# Kill process on port 11001
PID_11001=$(sudo lsof -ti:11001)
if [ ! -z "$PID_11001" ]; then
    sudo kill -9 $PID_11001
    echo "Killed process $PID_11001 on port 11001"
else
    echo "No process found on port 11001"
fi



echo "Done!"