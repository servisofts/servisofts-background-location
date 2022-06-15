import { NativeModules, NativeEventEmitter, AppRegistry, Platform } from 'react-native';
import SStorage from '../SStorage/';
import Data from "./Data";
const SSBackgroundLocation = NativeModules.SSBackgroundLocation;

export type _Props = {
    nombre?: string,
    label?: string,
    minTime?: number,
    minDistance?: number,
}

const PROPS = {
    nombre: "Servisofts BackgroundLocation",
    label: "Location used in background.",
    minTime: 1000,
    minDistance: 0,
}

const log = (...args: any) => {
    console.log("[SBLocation]",...args);
}
class SBLocation {
    static connected = false;
    static Listeners = [];
    static addListener(callback) {
        this.Listeners.push(callback);
    }
    static notifyAll(obj) {
        if(SBLocation.callback){
            SBLocation.callback(obj);
        }
        this.Listeners.forEach(listener => listener(obj));
    }
    static removeListener(callback) {
        this.Listeners = this.Listeners.filter(listener => listener !== callback);

    }
    static isStarted() {
        return this.connected;
    }
    static start(props: _Props) {
        SSBackgroundLocation.start(JSON.stringify({
            ...PROPS,
            ...props
        })).then(resp => {
            this.connected = true;
            this.notifyAll({ type: "start" });
            SStorage.setItem("SBLocation", JSON.stringify(props));
            if (Data.lastLocation) {
                this.Listener({ data: Data.lastLocation });
            }
            log("start", resp);
        });
    }
    static stop() {
        SSBackgroundLocation.stop().then(resp => {
            this.connected = false;
            this.notifyAll({ type: "stop" });
            SStorage.removeItem("SBLocation");
            log("stop", resp);
        });
    }
    static isRegister = false;
    static callback = null;
    static initEmitter(_callback: (data: any) => boolean) {
        SBLocation.callback = _callback;
        if (SBLocation.isRegister) return;
        SBLocation.isRegister = true;
        if (Platform.OS == "android") {
            try {
                SBLocation.isRegister = true;
                AppRegistry.registerHeadlessTask('SSBackgroundLocation', () => this.Listener);
            } catch (e) {
                log("tast existente");
            }
        } else if (Platform.OS == "ios") {
            var em = new NativeEventEmitter(SSBackgroundLocation);
            log(em.listeners);
            em.addListener('onLocationChange', this.Listener);
        }
        log("initEmitter");

        SStorage.getItem("SBLocation", (resp => {
            if (resp) {
                this.start(JSON.parse(resp));
            }
        }))
    }

    static Listener = async (props) => {
        if (typeof props.data == "string") {
            props.data = JSON.parse(props.data);
        }
        Data.onLocationChange(props.data);
        try {

            // SStorage.getItem("usr_log", (resp: any) => {
            //     var usr = JSON.parse(resp);
            //     SSocket.sendHttpAsync(SSocket.api.root + "api", {
            //         component: "backgroundLocation",
            //         type: "onChange",
            //         estado: "cargando",
            //         key_usuario: usr.key,
            //         data: Data.lastLocation,
            //     })
            this.notifyAll({ type: "locationChange", data: Data.lastLocation, key_usuario: "" });

            // })

        } catch (e) {

        }


    }
}
export default SBLocation;