# Day 8 - Integrate GPS

## Objectives
Integration of GPS location tracking for the drone health monitoring application and uploading the location data on the cloud dashboard.

## Work Done
- Generation of GPS data in NMEA format and integration with the existing ESP32 system.
- Reading and parsing GPS sentences to extract latitude and longitude coordinates.
- Conversion of GPS coordinates to useful location information.
- Integration of the location GPS parameters along with the sensor monitoring values.
- Updated the ThingSpeak channel to upload battery, temperature, altitude, motor status, latitude, and longitude data.
- Successful data transmission and cloud visualization.

## Outcomes
- Successfully added GPS-based location monitoring functionality to the drone health monitoring system.
- Improved the IoT system by integrating location and sensor monitoring.
- Acquired knowledge of working with GPS data and ThingSpeak platform.
