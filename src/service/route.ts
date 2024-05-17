import { RouteProps, Waypoint } from '../types';
import { generateGoogleRoute } from './helpers/googleMaps';
import { getWaypointsFromOverpass } from './helpers/overpass';
import { Request, Response } from "express";

// Function to handle the GET request
function getHandler(req: Request, res: Response) {
    // Logic to retrieve data from the database
    // ...
    // Send the response
    res.status(200);
    res.json({message: 'GET request processed'});
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
            console.log(generatedWaypoints);
            
        }
    }

    if (surfaceType) {
        surfaceWaypoints = await getWaypointsFromOverpass(radius, start.lat, start.lng, surfaceType);
        console.log(generatedWaypoints);
    }

    return [...generatedWaypoints, ...surfaceWaypoints,];
}

async function generateRunningRoute({ startPoint, endPoint, waypoints, distance, advancedOptions }: RouteProps) {

    const generatedWaypoints = await getGeneratedWaypoints(distance!, startPoint, advancedOptions.poiTypes, advancedOptions.surfaceType);

    const allWaypoints = [ ...waypoints, ...generatedWaypoints];
    const runningRouteWaypoints: Waypoint[] = [];


    let accumulatedDistance = 0;

    console.log(allWaypoints);
    console.log(allWaypoints.length);
    

    for (let i = 0; i < allWaypoints.length; i++) {
        const previousWaypoint = i === 0 ? startPoint : allWaypoints[i - 1];
        const waypoint1 = allWaypoints[i];
        const calculatedDistance = calculateDistance(previousWaypoint, waypoint1);
        const distanceToEnd = calculateDistance(waypoint1, endPoint);
        // accumulatedDistance += (accumulatedDistance + calculatedDistance) > distance *1000 ? 0 : calculatedDistance;
        if ((accumulatedDistance + calculatedDistance) > distance *1000 || accumulatedDistance + distanceToEnd > distance * 1000) {
            accumulatedDistance += 0;
        } else {
            accumulatedDistance += calculatedDistance;
        }

        if (accumulatedDistance <= distance * 1000 ) { // Convert km to meters
            runningRouteWaypoints.push(waypoint1);
        } else {
            console.log(accumulatedDistance);
            break;
        }

        //Only 25 waypoints are allowed in a single request
        if (runningRouteWaypoints.length === 24) {
            break;
        }
    }

    console.log('Running route waypoints:', runningRouteWaypoints.length);
    
    console.log(runningRouteWaypoints);
    
    // Generate route using Google Maps Directions API
    try {
        const response = await generateGoogleRoute(startPoint, endPoint, runningRouteWaypoints);
        return response.data;
    } catch (error) {        
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

//This is probably obsolete since it's possible to determine total distance based on the average speed of the user, this can be done in the frontend
// async function generateRunningRouteByTime({ startPoint, endPoint, waypoints, time, advancedOptions }: RouteProps) {


//     const generatedWaypoints = await getGeneratedWaypoints(time!, startPoint, advancedOptions.poiTypes, advancedOptions.surfaceType);

//     const allWaypoints = [startPoint, ...waypoints, ...generatedWaypoints, endPoint];
//     const runningRouteWaypoints: Waypoint[] = [];
//     let accumulatedTime = 0;

//     for (let i = 0; i < allWaypoints.length - 1; i++) {
//         const waypoint1 = allWaypoints[i];
//         const waypoint2 = allWaypoints[i + 1];
//         const time = await calculateTravelTime(waypoint1, waypoint2);

//         accumulatedTime += time;
//         if (accumulatedTime <= time) {
//             runningRouteWaypoints.push(waypoint1);
//         } else {
//             break;
//         }
//     }

//     try {
//         const response = await generateGoogleRoute(startPoint, endPoint, runningRouteWaypoints);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching route:', error);
//         return null;
//     }
// }

// async function calculateTravelTime(point1, point2) {
//     const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${point1.lat},${point1.lng}&destinations=${point2.lat},${point2.lng}&key=YOUR_API_KEY`;

//     try {
//         const response = await get(googleMapsApiUrl);
//         const travelTimeSeconds = response.data.rows[0].elements[0].duration.value;
//         return travelTimeSeconds;
//     } catch (error) {
//         console.error('Error calculating travel time:', error);
//         return Infinity; // Assume infinite travel time in case of error
//     }
// }

function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
}


// Export the functions to be used in other files
export default {
    getHandler,
    postHandler: createRoute,
    putHandler,
    deleteHandler
};