class Timer {
  constructor(label) {
    this.label = label;
    this.samples = [];
    this.start();
  }

  label() {
    return this.label;
  }

  start() {
    this.t0 = process.hrtime();
  }

  end() {
    let [diffSec,diffNano] = process.hrtime(this.t0);
    this.samples.push(diffNano);
    return diffNano/Math.pow(10,6);
  }

  avg() {
    let sum = this.samples.reduce((a,b) => a + b);
    return ((sum / this.samples.length) / Math.pow(10, 6)).toFixed(3);
  }

  measureFn(fn) {
    let timer = this;
    timer.start();
    let fnReturnData = fn();
    if (!!fnReturnData && fnReturnData.constructor === 'Promise') {
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

module.exports = Timer;
