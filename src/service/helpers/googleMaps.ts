import { Waypoint } from "../../types";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { MAPS_API_URL, MAPS_API_KEY } = process.env;

export async function generateGoogleRoute(startPoint: Waypoint, endPoint: Waypoint, waypoints: Waypoint[]) {
    // Generate route using Google Maps Directions API
    const googleMapsApiUrl = `${MAPS_API_URL}:computeRoutes`

    const body = {
        origin: {
            location: {
                latLng: {
                    latitude: startPoint.lat,
                    longitude: startPoint.lng
                }
            }
        },
        destination: {
            location: {
                latLng: {
                    latitude: endPoint.lat,
                    longitude: endPoint.lng
                }
            }
        },
        intermediates: [
            ...waypoints.map(waypoint => ({
                location: {
                    latLng: {
                        latitude: waypoint.lat,
                        longitude: waypoint.lng
                    }
                }
            }))
        ],
        travelMode: 'WALK',
        units: "IMPERIAL"
    }
    const response = await axios.post(googleMapsApiUrl, body, {
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': `${MAPS_API_KEY}`,
            'X-Goog-FieldMask': '*'
        }
    });

    console.log(response.data.routes[0].legs);
    
    return response.data;
}