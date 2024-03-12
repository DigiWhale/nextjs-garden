import time
import board
import busio
import adafruit_tsl2561
import redis
import csv
from datetime import datetime

# Initialize the I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Create the sensor instance
sensor = adafruit_tsl2561.TSL2561(i2c)

# Initialize Redis client
redis_client = redis.Redis(host='gardenpi.local', port=6379, db=0)

# Function to update sensor reading lists in Redis
def update_sensor_list(sensor_name, value):
    current_list = redis_client.lrange(sensor_name, 0, -1)
    current_list = [float(x.decode('utf-8')) for x in current_list]
    current_list.append(value)
    
    # Trim the list if it exceeds 1000 items
    if len(current_list) > 10000:
        current_list = current_list[-10000:]
        
    # Store the updated list back in Redis
    redis_client.delete(sensor_name)
    redis_client.rpush(sensor_name, *map(str, current_list))
    
def log_data_to_csv(index, lux, infrared, broadband, filename='/home/pi/lux_data.csv'):
    """
    Logs sensor data to a CSV file, appending a new row with the current timestamp,
    index, lux, infrared, and broadband values.

    :param index: The iteration index or any identifier for the data point.
    :param lux: Lux sensor reading.
    :param infrared: Infrared sensor reading.
    :param broadband: Broadband sensor reading.
    :param filename: Name of the CSV file to which data is logged. Defaults to 'sensor_data.csv'.
    """
    # Determine whether the file already exists and hence if we need to write headers
    try:
        with open(filename, 'x') as csvfile:
            # File doesn't exist, create it and write the header
            writer = csv.writer(csvfile)
            writer.writerow(['Timestamp', 'Index', 'Lux', 'Infrared', 'Broadband'])
    except FileExistsError:
        pass  # File already exists, no need to add the header

    # Open the file in append mode and log the data
    with open(filename, 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        writer.writerow([current_time, index, lux, infrared, broadband])

# Main loop to read from the sensor and update Redis
try:
    while True:
        # Assuming you've configured the sensor according to your needs

        # Read sensor values
        broadband = sensor.broadband
        infrared = sensor.infrared
        lux = sensor.lux
        
        # Update Redis
        update_sensor_list('broadband', broadband)
        update_sensor_list('infrared', infrared)
        if lux is not None:
            update_sensor_list('lux', lux)

        # Wait for 10 seconds before the next read
        log_data_to_csv(0, lux, infrared, broadband)
        time.sleep(10)

finally:
    print("Script ended.")
