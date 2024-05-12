import axios from 'axios';

export async function getWaypointsFromOverpass(radius: number, latitude: number, longitude: number, poiType: string) {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    console.log(poiType);
    console.log(radius);
    
    
    // Construct the Overpass query
    const data = `[out:json];node(around:${radius*1000},${latitude},${longitude})["natural"="tree"];out;`;

    try {
        // Make a GET request to the Overpass API
        const response = await axios.post(overpassUrl, data);

        // Parse the response and extract the relevant waypoints
        const waypoints = response.data.elements.map((element: any) => ({
            lat: element.lat,
            lng: element.lon
        }));
        
        console.log(response.data);
        
        return waypoints;
    } catch (error) {
        console.error('Error fetching waypoints from Overpass API:', error);
        return null;
    }
}

module.exports = {
    getWaypointsFromOverpass
};