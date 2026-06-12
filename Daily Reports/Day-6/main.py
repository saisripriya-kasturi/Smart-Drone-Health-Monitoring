import network
import urequests
import time

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect("Wokwi-GUEST", "")

while not wifi.isconnected():
    time.sleep(1)

API_KEY = "ZM3EZ4U50N323BO0"

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

    url = f"https://api.thingspeak.com/update?api_key={API_KEY}&field1={battery}&field2={temperature}&field3={altitude}&field4={motor}"

    urequests.get(url)

    print("Battery:", battery)
    print("Temperature:", temperature)
    print("Altitude:", altitude)
    print("Motor Status:", motor)

    time.sleep(20)