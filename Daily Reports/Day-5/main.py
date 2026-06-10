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
    battery = 95
    temperature = 35
    altitude = 120

    url = f"https://api.thingspeak.com/update?api_key={API_KEY}&field1={battery}&field2={temperature}&field3={altitude}"

    urequests.get(url)

    print("Battery:", battery)
    print("Temperature:", temperature)
    print("Altitude:", altitude)

    time.sleep(20)