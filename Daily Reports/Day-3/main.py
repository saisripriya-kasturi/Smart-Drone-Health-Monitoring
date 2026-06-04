from machine import Pin

green = Pin(2, Pin.OUT)
red = Pin(4, Pin.OUT)

while True:

    command = input("Type takeoff or land: ")

    if command == "takeoff":
        green.on()
        red.off()

    if command == "land":
        green.off()
        red.on()