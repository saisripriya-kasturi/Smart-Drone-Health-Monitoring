# Day 11 - Dashboard Deployment and Cloud Integration

## Objective
To deploy the Smart Drone Health Monitoring Dashboard and integrate it with ThingSpeak cloud data for real-time monitoring and visualization.

## Work Done
- Connected the web dashboard with ThingSpeak cloud using the Read API.
- Retrieved real-time drone monitoring data from ThingSpeak fields.
- Displayed battery, temperature, altitude, motor status, GPS coordinates, and flight duration values on the dashboard.
- Implemented login authentication functionality for secure dashboard access.
- Deployed the dashboard application using Netlify cloud hosting.
- Verified successful communication between the cloud platform and dashboard.

## Cloud Data Structure
The ThingSpeak channel was organized with separate fields for efficient data storage:

- Field 1: Battery Percentage
- Field 2: Temperature
- Field 3: Altitude
- Field 4: Motor Status
- Field 5: GPS Latitude
- Field 6: GPS Longitude
- Field 7: Flight Duration

## Testing Results
- User authentication: Successful
- ThingSpeak data retrieval: Successful
- Dashboard data display: Successful
- Real-time updates: Successful
- Cloud deployment: Successful
## Outcome
- Successfully developed and deployed a web-based drone monitoring dashboard connected with ThingSpeak cloud. The system provides real-time visualization of drone health parameters through an accessible user interface.
