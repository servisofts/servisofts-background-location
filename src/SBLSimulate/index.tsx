import SBLocation from "../SBLocation";
import Data from "../SBLocation/Data";

class SBLSimulate {
    static _run = false;

    static arr;
    static props;
    static index;

    static start(arr, props = { speed_x: 1, startIndex: 0, }) {
        if (this._run) return;
        this.arr = arr;
        this.props = props;
        SBLocation.connected = true;
        SBLocation.notifyAll({ type: "start", estado: "exito" });

        this._run = true;
        this.index = props.startIndex;
        this._thread();
        // if (Data.lastLocation) {
        //     this.Listener({ data: Data.lastLocation });
        // }
    }
    static stop() {
        this._run = false;
        SBLocation.connected = false;
        SBLocation.notifyAll({ type: "stop" });
    }


    static _thread = async () => {
        if (!this._run) return;
        if (this.arr.length == 0) {
            this.stop();
            return;
        }
        if (this.index >= this.arr.length) {
            this.stop();
            return;
        }
        var cur = this.arr[this.index];
        SBLocation.Listener({ data: cur });
        if (this.arr.length > this.index + 1) {
            var next = this.arr[this.index + 1];
            var time = next.time - cur.time;
            await new Promise(resolve => setTimeout(resolve, time / this.props.speed_x)).then(() => {
                this.index++;
                this._thread();
            })
        }
    }


}
export default SBLSimulate; 