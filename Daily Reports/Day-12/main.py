import network
import urequests
import time
import random

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect("Wokwi-GUEST", "")

while not wifi.isconnected():
    time.sleep(1)

print("WiFi Connected")

API_KEY = "HJT37WUHP1VI2EZG"

start_time = time.time()


def convert_coordinate(value):
    degree = int(value / 100)
    minutes = value - (degree * 100)
    return degree + (minutes / 60)


latitude = 0
longitude = 0

file = open("gps.txt", "r")

for line in file:
    if line.startswith("$GPRMC"):
        data = line.split(",")

        lat = float(data[3])
        lon = float(data[5])

        latitude = convert_coordinate(lat)
        longitude = convert_coordinate(lon)

file.close()


while True:

    battery = random.randint(20,100)
    temperature = random.randint(25,80)
    altitude = random.randint(50,200)
    motor = random.randint(0,1)

    flight_time = round(time.time() - start_time)


    if battery < 20:
        print("LOW BATTERY ALERT")

    elif temperature > 70:
        print("OVERHEATING ALERT")

    elif flight_time > 300:
        print("FLIGHT TIME LIMIT ALERT")

    else:
        print("DRONE HEALTHY")


    url = f"https://api.thingspeak.com/update?api_key={API_KEY}&field1={battery}&field2={temperature}&field3={altitude}&field4={motor}&field5={latitude}&field6={longitude}&field7={flight_time}"


    response = urequests.get(url)
    response.close()


    print("Battery:", battery)
    print("Temperature:", temperature)
    print("Altitude:", altitude)
    print("Motor Status:", motor)
    print("Latitude:", latitude)
    print("Longitude:", longitude)
    print("Flight Duration:", flight_time, "seconds")


    time.sleep(20)