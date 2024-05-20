import { get } from "http";
import { Waypoint } from "../types";
import { getWeatherFromOpenWeatherMap } from "./helpers/openWeatherMap";


async function getWeather(point: Waypoint): Promise<any> {
    const data = await getWeatherFromOpenWeatherMap(point);
    console.log(data);
    
    return data;
}

export default {
    getHandler: getWeather,
};