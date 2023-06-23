import Events from "./Events";
import Normalizador from "./Normalizador";

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
export type NomarlizarType = {
    distance?: number,
    time?: number,
    accuracy?: number,
    delay?: number,
}

export default class Data {

    static props = {
        historyLimit: 50,
    }
    static history: any = [];
    static historyNormaliced = [];
    static lastLocation: LocationType = null;
    static lastLocationNormaliced: LocationType = null;

    static procesar(location: LocationType) {
        location.rotation = 0;
        location.distanceMoved = 0;
        if (Data.lastLocation) {
            if (Data.lastLocation.time == location.time) {
                return null;
            }
            const last = Data.lastLocation;
            location.distanceMoved = Events.getDistance(last.latitude, last.longitude, location.latitude, location.longitude);
            location.rotation = Events.getRotation(last.latitude, last.longitude, location.latitude, location.longitude);
        }
        return location;
    }
    static onLocationChange(_location: LocationType) {
        var location = Data.procesar(_location);
        if (!location) return;
        Data.lastLocation = location;
        Data.history.push(location);
        if (Data.history.length > this.props.historyLimit) {
            Data.history.shift();
        }
        Data.normalizar(Data.history);
    }

    static normalizar(arr, props: NomarlizarType = { distance: 10, time: 1, accuracy: 50 }) {
        this.lastLocationNormaliced = Normalizador.normalizar(arr, props);
        Data.historyNormaliced.push(this.lastLocationNormaliced);
        if (Data.historyNormaliced.length > this.props.historyLimit) {
            Data.historyNormaliced.shift();
        }
        return Data.historyNormaliced;
    }

    static getLastLocation() {
        return Data.lastLocation;
    }
}