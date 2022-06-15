import Events from "./Events";

export type LocationType = {
    latitude: number,
    longitude: number,
    speed: number,
    time: number,
    accuracy: number,
    altitude: number,
    rotation?: number,
    distanceMoved?: number,
}

export default class Data {

    static props = {
        historyLimit: 10,
    }
    static history = [];
    static lastLocation: LocationType = null;

    static onLocationChange(location: LocationType) {

        location.rotation = 0;
        Data.lastLocation = location;
        Data.history.push(location);
        if (Data.history.length > this.props.historyLimit) {
            Data.history.shift();
        }
        if (Data.history.length > 1) {
            let last = Data.history[Data.history.length - 2];
            let dist = Events.getDistance(last.latitude, last.longitude, location.latitude, location.longitude);
            let rotation = Events.getRotation(last.latitude, last.longitude, location.latitude, location.longitude);
            // let time = location.time - last.time;
            // let speed = dist / time;
            location.distanceMoved = dist;
            // location.speed = speed;
            location.rotation = rotation;
        }
        // console.log("[SBL - DATA] onLocationChange", Data.lastLocation);
    }

    static getLastLocation() {
        return Data.lastLocation;
    }
}