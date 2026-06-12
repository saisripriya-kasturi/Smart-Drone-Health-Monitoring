# Day 6 – Monitoring Dashboard with Alerts and Graphs

## Objective

To improve the functionality of the existing ESP32 data acquisition system to monitor various health parameters of the drone and visualize them on the cloud dashboard.

## Work Done

* Modified the data acquisition program of ESP32 to collect the following data:

  * Battery Level
  * Temperature
  * Altitude
  * Motor Status

* Uploading the acquired data on the ThingSpeak cloud database via Wi-Fi communication.

* Creating the dashboard for monitoring purposes using ThingSpeak Widgets:

  * Battery Level Gauge
  * Temperature Gauge
  * Altitude Graph
  * Motor Status Indicator

* Implementing basic alert conditions for health monitoring:

  * Low Battery
  * Overheating

## Data Flow

ESP32 → Wi-Fi → ThingSpeak Cloud → Dashboard Display

## Learning Outcomes

* Learned to use ESP32 for the acquisition of multiple data parameters.
* Learned about the cloud-based monitoring system using ThingSpeak.
* Learned the creation of a dashboard through graphs and other indicators.
* Implemented simple alert conditions for drone health monitoring.

## Conclusion

Successfully created a simulated monitoring dashboard for drone using the ESP32 microcontroller and ThingSpeak.
