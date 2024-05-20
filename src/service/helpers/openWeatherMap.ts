import axios from 'axios';
import dotenv from "dotenv";
import { Waypoint } from '../../types';

dotenv.config();

const { OWS_KEY, OWS_URL} = process.env;

export async function getWeatherFromOpenWeatherMap(point: Waypoint) {
    const baseUrl = OWS_URL!;

    try {
        // Make a GET request to the Overpass API
        const response = await axios.get(`${baseUrl}lat=${point.lat}&lon=${point.lng}&appid=${OWS_KEY}&units=metric`);

        return response.data;
    } catch (error: any) {
        console.error('Error fetching weather data from OpenWeatherMap API:', error);
        return [];
    }
}

module.exports = {
    getWeatherFromOpenWeatherMap
};