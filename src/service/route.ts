import { log } from 'console';
import { RouteProps, Waypoint } from '../types';
import { calculateElevation, generateGoogleRoute } from './helpers/googleMaps';
import { getWaypointsFromOverpass } from './helpers/overpass';
import { Request, Response } from "express";

// Function to handle the GET request
function getHandler(req: Request, res: Response) {
    // Logic to retrieve data from the database
    // ...
    // Send the response
    res.status(200);
    res.json({ message: 'GET request processed' });
}

// Function to handle the POST request
function createRoute(body: RouteProps) {
    if (body.distance) {
        return generateRunningRoute(body)
    }
    // else if (body.time) {
    //     return generateRunningRouteByTime(body)
    // }

    throw new Error('Invalid request body: must include "distance" property');
}

// Function to handle the PUT request
function putHandler(req: Request, res: Response) {
    // Logic to update an existing record in the database
    // ...
    // Send the response
    res.send('PUT request processed');
}

// Function to handle the DELETE request
function deleteHandler(req: Request, res: Response) {
    // Logic to delete a record from the database
    // ...
    // Send the response
    res.send('DELETE request processed');
}

async function getGeneratedWaypoints(radius: number, start: Waypoint, poiTypes?: string[], surfaceType?: string): Promise<Waypoint[]> {
    let generatedWaypoints = [];
    let surfaceWaypoints = [];

    if (poiTypes) {
        for (const type of poiTypes) {
            generatedWaypoints = await getWaypointsFromOverpass(radius, start.lat, start.lng, type);
        }
    }

    if (surfaceType) {
        surfaceWaypoints = await getWaypointsFromOverpass(radius, start.lat, start.lng, surfaceType);

    }

    return [...generatedWaypoints, ...surfaceWaypoints,];
}

async function generateRunningRoute({ startPoint, endPoint, waypoints, distance, advancedOptions }: RouteProps) {

    const generatedWaypoints = await getGeneratedWaypoints(distance!, startPoint, advancedOptions.poiTypes, advancedOptions.surfaceType);


    const runningRouteWaypoints: Waypoint[] = [];

    generatedWaypoints.sort((a, b) => {
        return calculateDistance(startPoint, a) - calculateDistance(startPoint, b);
    });

    let accumulatedDistance = 0;


    const elevationWaypoints = await calculateElevation([startPoint, ...generatedWaypoints.slice(0, 510), endPoint]);

    const filteredWaypoints = elevationWaypoints.filter((waypoint) => {
        const elevationChange = Math.abs(waypoint.elevation - elevationWaypoints[0].elevation); // Assuming startPoint elevation as reference
        if (elevationChange < 50) { // Adjust thresholds for flat, medium, and steep as needed
            return advancedOptions.height === 'flat';
        } else if (elevationChange < 100) {
            return advancedOptions.height === 'medium';
        } else {
            return advancedOptions.height === 'steep';
        }
    });

    const accumulatedWaypoints = filteredWaypoints != undefined && filteredWaypoints.length > 2 ? filteredWaypoints : generatedWaypoints;
    const allWaypoints = [...waypoints.sort((a, b) => calculateDistance(startPoint, a) - calculateDistance(startPoint, b)), ...accumulatedWaypoints];
    
    console.log('All waypoints:', allWaypoints.length);
    console.log(allWaypoints);
    
    const waypointLimit = 25;
    let timeOut = 0;
    if (allWaypoints.length === 0) {
        let currentPoint = startPoint;
        while (accumulatedDistance < distance * 10000) { // Convert km to meters
            // Find the next point along the route
            const nextPoint = findNextPoint(currentPoint, endPoint, distance * 1000 - accumulatedDistance, (distance / 6 * 1000));
            const calculatedDistance = calculateDistance(currentPoint, nextPoint);

            // Add the next point to the running route waypoints
            runningRouteWaypoints.push(nextPoint);
            accumulatedDistance += calculatedDistance;

            // Update currentPoint for the next iteration
            console.log(currentPoint);

            currentPoint = nextPoint;
            if (timeOut > 1000 || runningRouteWaypoints.length === 4) {
                break;
            }
            timeOut++;
        }
    } else {
        for (let i = 0; i < allWaypoints.length; i++) {
            const previousWaypoint = i === 0 ? startPoint : allWaypoints[i - 1];
            const waypoint1 = allWaypoints[i];
            const calculatedDistance = calculateDistance(previousWaypoint, waypoint1);
            const distanceToEnd = calculateDistance(waypoint1, endPoint);
            // accumulatedDistance += (accumulatedDistance + calculatedDistance) > distance *1000 ? 0 : calculatedDistance;
            if ((accumulatedDistance + calculatedDistance) > distance * 1000 || accumulatedDistance + distanceToEnd > distance * 1000) {
                accumulatedDistance += 0;
            } else {
                accumulatedDistance += calculatedDistance;
            }

            if (accumulatedDistance <= distance * 1000) { // Convert km to meters
                runningRouteWaypoints.push(waypoint1);
            } else {
                console.log(accumulatedDistance);
                break;
            }

            //Only 25 waypoints are allowed in a single request
            if (runningRouteWaypoints.length === waypointLimit) {
                console.log(accumulatedDistance);
                break;
            }
        }
    }
    runningRouteWaypoints.sort((a, b) => {
        return calculateDistance(a, endPoint) - calculateDistance(b, endPoint);
    });

    console.log('Running route waypoints:', runningRouteWaypoints.length);

    console.log(runningRouteWaypoints);



    // Generate route using Google Maps Directions API
    try {
        const createdRoute = await generateGoogleRoute(startPoint, endPoint, runningRouteWaypoints);
        return createdRoute.routes;
    } catch (error: any) {
        console.error('Error fetching route:', error.response.data);
        return null;
    }
}

function calculateDistance(point1: Waypoint, point2: Waypoint) {
    // Assuming point1 and point2 are objects with 'lat' and 'lng' properties
    const earthRadius = 6371000; // meters
    const lat1 = toRadians(point1.lat);
    const lat2 = toRadians(point2.lat);
    const deltaLat = toRadians(point2.lat - point1.lat);
    const deltaLng = toRadians(point2.lng - point1.lng);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}


function findNextPoint(currentPoint: Waypoint, endPoint: Waypoint, remainingDistance: number, distanceBetweenPoints: number = 1000): Waypoint {
    // Calculate the bearing from the current point to the end point
    const bearing = calculateBearing(currentPoint, endPoint);
    console.log(bearing);


    // Calculate the distance to the next point based on the remaining distance
    const distanceToNextPoint = Math.min(remainingDistance, distanceBetweenPoints); // Choose a distance (e.g., 1 km)

    // Calculate the coordinates of the next point along the bearing
    const nextPoint = calculateDestinationPoint(currentPoint, bearing, distanceToNextPoint);

    return nextPoint;
}


function calculateBearing(point1: Waypoint, point2: Waypoint): number {
    const lat1 = toRadians(point1.lat);
    const lon1 = toRadians(point1.lng);
    const lat2 = toRadians(point2.lat);
    const lon2 = toRadians(point2.lng);

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const bearing = Math.atan2(y, x);

    return (toDegrees(bearing) + 360) % 360;
}

function calculateDestinationPoint(startPoint: Waypoint, bearing: number, distance: number): Waypoint {
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRadians(startPoint.lat);
    const λ1 = toRadians(startPoint.lng);
    const δ = distance / R; // Angular distance in radians

    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(bearing));
    const λ2 = λ1 + Math.atan2(Math.sin(bearing) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

    const lat = toDegrees(φ2);
    const lng = toDegrees(λ2);

    return { lat, lng };
}


function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

function toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}


// Export the functions to be used in other files
export default {
    getHandler,
    postHandler: createRoute,
    putHandler,
    deleteHandler
};