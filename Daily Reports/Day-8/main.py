import network
import urequests
import time

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect("Wokwi-GUEST", "")

while not wifi.isconnected():
    time.sleep(1)

print("WiFi Connected")

API_KEY = "HJT37WUHP1VI2EZG"


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

    battery = 90
    temperature = 38
    altitude = 150
    motor = 1


    if battery < 20:
        print("LOW BATTERY ALERT")

    elif temperature > 70:
        print("OVERHEATING ALERT")

    else:
        print("DRONE HEALTHY")


    url = f"https://api.thingspeak.com/update?api_key={API_KEY}&field1={battery}&field2={temperature}&field3={altitude}&field4={motor}&field5={latitude}&field6={longitude}"


    response = urequests.get(url)
    response.close()


    print("Battery:", battery)
    print("Temperature:", temperature)
    print("Altitude:", altitude)
    print("Motor Status:", motor)
    print("Latitude:", latitude)
    print("Longitude:", longitude)


    time.sleep(20)
