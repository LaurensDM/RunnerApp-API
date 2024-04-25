import axios from 'axios';

export async function getWaypointsFromOverpass(radius: number, latitude: number, longitude: number, poiType: string) {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    // Construct the Overpass query
    const query = `[out:json];
        node(around:${radius},${latitude},${longitude})["${poiType}"];
        out;`;

    try {
        // Make a GET request to the Overpass API
        const response = await axios.get(overpassUrl, {
            params: {
                data: query
            }
        });

        // Parse the response and extract the relevant waypoints
        const waypoints = response.data.elements.map((element: any) => ({
            lat: element.lat,
            lng: element.lon
        }));

        return waypoints;
    } catch (error) {
        console.error('Error fetching waypoints from Overpass API:', error);
        return null;
    }
}

module.exports = {
    getWaypointsFromOverpass
};