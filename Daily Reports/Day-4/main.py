import network
import urequests
import time


wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect("Wokwi-GUEST", "")

while not wifi.isconnected():
    print("Connecting to WiFi...")
    time.sleep(1)

print("Connected to WiFi!")

API_KEY = "6AV4DZNBSUKDLQEM"

while True:
    battery = 95

    url = f"https://api.thingspeak.com/update?api_key={API_KEY}&field1={battery}"

    response = urequests.get(url)

    print("Battery Level Sent:", battery)

    response.close()

    time.sleep(20)