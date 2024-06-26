type RouteProps = {
    startPoint: Waypoint;
    endPoint: Waypoint;
    waypoints: Waypoint[];
    distance: number;
    time?: number;
    advancedOptions: AdvancedOptions;
};

type Waypoint = {
    lat: number;
    lng: number;
};

type WaypointElevation = {
    lat: number;
    lng: number;
    elevation: number;
};

type AdvancedOptions = {
    poiTypes?: string[];
    surfaceType?: string;
    height: string,
};

export { RouteProps, Waypoint, AdvancedOptions, WaypointElevation};