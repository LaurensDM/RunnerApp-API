import { Waypoint } from "../../types";
import axios from "axios";

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
        travelMode: 'WALKING',
        units: "IMPERIAL"
    }
    const response = await axios.post(googleMapsApiUrl, body, {
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': `${MAPS_API_KEY}`
        }
    });
    return response.data;
}