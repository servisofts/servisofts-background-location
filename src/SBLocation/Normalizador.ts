import { LocationType, NomarlizarType } from "./Data";
import Events from "./Events";

export default class Normalizador {
    static normalizar(arr, props: NomarlizarType) {
        return new Normalizador(arr, props).start();
    }

    //CLASS

    arr;
    props: NomarlizarType;

    currentPos: LocationType;
    lastPosition: LocationType;

    constructor(arr, props: NomarlizarType) {
        this.arr = arr;
        // this.props = props;
        this.props = { distance: 10, time: 1, accuracy: 50, delay: 3000 };
        this.start()
    }

    start() {
        // var arrFinal = [];
        if (this.arr.length == 0) return null;
        this.currentPos = this.arr[0];
        this.lastPosition = this.arr[this.arr.length - 1];
        this.arr.map((obj, index) => {
            obj.index = index;
            obj = this.filterDelay(obj);
            obj = this.filterAccuracy(obj);
            obj = this.filterDistance(obj);
            if (!obj) return;
            this.currentPos = obj;
        })
        return this.currentPos;
    }
    getDesv(list) {

        var sumAccuracy = 0;
        var sumRotation = 0;
        var prod = 0;
        var sumLat = 0;
        var sumLng = 0;
        list.map(p => {
            var percent = 1 / (Math.pow(p.accuracy, 2));
            sumAccuracy += p.accuracy;
            sumRotation += p.rotation * percent;
            prod += percent;
            sumLat += p.latitude * percent;
            sumLng += p.longitude * percent;
        })
        var lat = sumLat / prod;
        var lng = sumLng / prod;
        var rotation = sumRotation / prod;

        var accuracy = sumAccuracy / list.length;
        return {
            latitude: lat,
            longitude: lng,
            accuracy: accuracy,
            rotation
        }
    }
    filterAccuracy(obj) {
        if (!obj) return;
        if (obj.accuracy > this.props.accuracy) return;
        var proximo = this.getNext(obj);
        var previo = this.getPrevius(obj);
        if (proximo && previo) {
            var arrPrev = this.getPreviusArr(obj).filter(itm => obj.time - itm.time < this.props.delay);
            var m_p13 = this.getDesv([...arrPrev, obj, ...this.getProximos(obj)]);
            return {
                ...obj,
                ...m_p13,
            };
        }

    }
    filterDistance(obj) {
        if (!obj) return;
        var dist = Events.getDistance(this.currentPos.latitude, this.currentPos.longitude, obj.latitude, obj.longitude);
        if (dist < this.props.distance) {
            return {
                ...obj,
                latitude: (this.currentPos.latitude + obj.latitude) / 2,
                longitude: (this.currentPos.longitude + obj.longitude) / 2,
            };
        }
        return obj;
    }
    filterDelay(obj) { //retrasa la posicion por el tiempo
        if (!obj) return;
        if (this.lastPosition.time - obj.time < this.props.delay) return;
        return obj;
    }

    getProximos(obj) {
        if (!obj) return [];
        return this.arr.filter(itm => itm.time > obj.time);
    }
    getNext(obj) {
        if (!obj) return;
        if (!obj.index) return;
        if (obj.index >= this.arr.length - 1) return;
        return this.arr[obj.index + 1];
    }
    getNextArr(obj) {
        if (!obj) return [];
        if (!obj.index) return [];
        if (obj.index >= this.arr.length - 1) return [];
        return this.arr.slice(obj.index + 1);
    }
    getPrevius(obj) {
        if (!obj) return;
        if (!obj.index) return;
        if (obj.index <= 0) return;
        return this.arr[obj.index - 1];
    }
    getPreviusArr(obj) {
        if (!obj) return [];
        if (!obj.index) return [];
        if (obj.index <= 0) return [];
        return this.arr.slice(0, obj.index);
    }
}