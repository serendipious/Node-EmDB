"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
class Timer {
    constructor(label) {
        this.samples = [];
        this.t0 = [0, 0];
        this.label = label;
        this.samples = [];
        this.start();
    }
    getLabel() {
        return this.label;
    }
    start() {
        this.t0 = process.hrtime();
    }
    end() {
        const [diffSec, diffNano] = process.hrtime(this.t0);
        this.samples.push(diffNano);
        return diffNano / Math.pow(10, 6);
    }
    avg() {
        const sum = this.samples.reduce((a, b) => a + b);
        return ((sum / this.samples.length) / Math.pow(10, 6)).toFixed(3);
    }
    measureFn(fn) {
        const timer = this;
        timer.start();
        const fnReturnData = fn();
        if (fnReturnData && typeof fnReturnData === 'object' && 'then' in fnReturnData) {
            return fnReturnData.then((retVal) => {
                timer.end();
                return retVal;
            });
        }
        else {
            timer.end();
            return fnReturnData;
        }
    }
}
exports.Timer = Timer;
//# sourceMappingURL=Timer.js.map