#!/usr/bin/env python3
import serial
import redis
import time
import csv
from datetime import datetime

# Initialize Redis connection
redis_client = redis.Redis(host='gardenpi.local', port=6379, db=0)

# Maximum number of TDS readings to store
max_readings = 10000

# CSV file setup
csv_filename = '/home/pi/tds_readings.csv'
csv_header = ['Timestamp', 'TDS']

def init_csv_file():
    """Initializes the CSV file with headers if it doesn't exist."""
    try:
        with open(csv_filename, 'x', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(csv_header)
    except FileExistsError:
        pass  # File already exists, no need to add the header again

def log_tds_to_csv(tds_value):
    """Logs a TDS reading to the CSV file."""
    with open(csv_filename, 'a', newline='') as f:
        writer = csv.writer(f)
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        writer.writerow([timestamp, tds_value])

def update_tds_list(tds_value):
    """Updates the Redis list for TDS readings and trims it to max_readings."""
    redis_client.rpush('tds', tds_value)  # Add the TDS reading to the list
    redis_client.ltrim('tds', -max_readings, -1)  # Trim the list

if __name__ == '__main__':
    ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1)
    ser.reset_input_buffer()

    init_csv_file()  # Initialize CSV file

    last_update_time = time.time()

    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8').rstrip()
            print(line)

            if "TDS----Value:" in line:
                try:
                    tds_value = float(line.split(":")[1].replace('ppm', '').strip())
                    # Log to CSV regardless of the 10-second Redis update interval
                    log_tds_to_csv(tds_value)
                    # Update Redis every 10 seconds
                    if time.time() - last_update_time >= 10:
                        update_tds_list(tds_value)
                        last_update_time = time.time()
                except ValueError:
                    print("Error extracting TDS value.")
            
            time.sleep(0.01)  # Reduce CPU usage
