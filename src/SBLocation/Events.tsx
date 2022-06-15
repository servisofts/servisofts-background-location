
export default class Events {
    static getDistance(lat1, lon1, lat2, lon2) {
        var rad = function (x) { return x * Math.PI / 180; }
        var R = 6378.137; //Radio de la tierra en km 
        var dLat = rad(lat2 - lat1);
        var dLong = rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) *
            Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        //aquí obtienes la distancia en metros por la conversion 1Km =1000m
        var d = R * c * 1000;
        return d;
    }
    static getRotation(lat1, lon1, lat2, lon2) {
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        var bearing:any = Math.atan2(y, x) * 180 / Math.PI;
        if (bearing < 0) {
            bearing = bearing + 360;
        }
        bearing = bearing.toFixed(0);
        // bearing = bearing * Math.PI / 180; // to rad
        return bearing;
    }
}