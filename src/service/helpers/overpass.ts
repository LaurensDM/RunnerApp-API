import axios from 'axios';

export async function getWaypointsFromOverpass(radius: number, latitude: number, longitude: number, poiType: string) {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    console.log(poiType);
    console.log(radius);

    const distanceRadius: number = Math.floor(radius * 1000 / 1.75);
        
    // Construct the Overpass query
    const data = `[out:json];node(around:${distanceRadius},${latitude},${longitude})["natural"="tree"];out center 50;`;

    try {
        // Make a GET request to the Overpass API
        const response = await axios.post(overpassUrl, data);

        // Parse the response and extract the relevant waypoints
        const waypoints = response.data.elements.map((element: any) => ({
            lat: element.lat,
            lng: element.lon
        }));
        
        return waypoints;
    } catch (error: any) {
        console.error('Error fetching waypoints from Overpass API:', error);
        return [];
    }
}

module.exports = {
    getWaypointsFromOverpass
};