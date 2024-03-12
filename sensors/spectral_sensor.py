import csv
from datetime import datetime
import time
import board
import redis
from adafruit_as726x import AS726x_I2C

# Connect to Redis server
redis_client = redis.Redis(host='gardenpi.local', port=6379, db=0)
max_list_length = 10000
# CSV file setup
csv_filename = '/home/pi/spectral_readings.csv'
csv_header = ['Timestamp', 'Violet', 'Blue', 'Green', 'Yellow', 'Orange', 'Red']

def init_csv_file():
    """Initializes the CSV file with headers if it doesn't exist."""
    try:
        with open(csv_filename, 'x', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(csv_header)
    except FileExistsError:
        pass  # File already exists, no need to add the header again

def log_data_to_csv(data_row):
    """Logs a row of sensor data to the CSV file."""
    with open(csv_filename, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(data_row)

# Initialize the CSV file
init_csv_file()

# Initialize sensor
i2c = board.I2C()  # uses board.SCL and board.SDA
sensor = AS726x_I2C(i2c)
sensor.conversion_mode = sensor.MODE_2

def update_color_list(color_name, value):
    """Updates the Redis list with the latest sensor reading for a given color."""
    current_list = redis_client.lrange(color_name, 0, -1)
    current_list = [float(x.decode('utf-8')) for x in current_list]  # Convert bytes to float
    current_list.append(value)  # Add the new reading
    
    if len(current_list) > max_list_length:
        current_list.pop(0)  # Remove the oldest entry if list exceeds max length
    
    redis_client.delete(color_name)  # Remove the old list
    redis_client.rpush(color_name, *[str(x) for x in current_list])  # Update the list in Redis

while True:
    # Wait for data to be ready
    while not sensor.data_ready:
        time.sleep(0.1)
    
    # Read sensor values
    violet = sensor.violet
    blue = sensor.blue
    green = sensor.green
    yellow = sensor.yellow
    orange = sensor.orange
    red = sensor.red

    # Get current timestamp
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Log sensor readings to CSV
    log_data_to_csv([timestamp, violet, blue, green, yellow, orange, red])

    # Update Redis with the latest sensor readings
    update_color_list('violet', violet)
    update_color_list('blue', blue)
    update_color_list('green', green)
    update_color_list('yellow', yellow)
    update_color_list('orange', orange)
    update_color_list('red', red)

    # Wait before the next update
    time.sleep(10)
