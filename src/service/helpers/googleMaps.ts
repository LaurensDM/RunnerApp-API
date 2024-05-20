import { Waypoint, WaypointElevation } from "../../types";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { MAPS_API_URL, MAPS_API_KEY, ROUTE_API_URL } = process.env;

export async function generateGoogleRoute(startPoint: Waypoint, endPoint: Waypoint, waypoints: Waypoint[]) {
    // Generate route using Google Maps Directions API
    const googleMapsRouteUrl = `${ROUTE_API_URL}:computeRoutes`

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
        units: "IMPERIAL",
        optimizeWaypointOrder: true,
    }
    const response = await axios.post(googleMapsRouteUrl, body, {
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': `${MAPS_API_KEY}`,
            'X-Goog-FieldMask': '*'
        }
    });    
    return response.data;
}

export async function calculateElevation(waypoints: Waypoint[]) : Promise<WaypointElevation[]>{
    const googleElevationApiUrl = `${MAPS_API_URL}/elevation/json?`
    const locations = waypoints.map(waypoint => (`${waypoint.lat},${waypoint.lng}`)).join('|');

    const response = await axios.get(`${googleElevationApiUrl}locations=${locations}&key=${MAPS_API_KEY}`);

    const elevationWaypoints : WaypointElevation[] = response.data.results.map((result: any, index: number) => ({
        lat: result.location.lat,
        lng: result.location.lng,
        elevation: result.elevation
    }));
    return elevationWaypoints;
}
