import { TimerInterface } from '../src/types';

export class Timer implements TimerInterface {
  private labelName: string;
  private samples: number[] = [];
  private t0: [number, number] = [0, 0];

  constructor(label: string) {
    this.labelName = label;
    this.samples = [];
    this.start();
  }

  public label(): string {
    return this.labelName;
  }

  public start(): void {
    this.t0 = process.hrtime();
  }

  public end(): number {
    const [, diffNano] = process.hrtime(this.t0);
    this.samples.push(diffNano);
    return diffNano / Math.pow(10, 6);
  }

  public avg(): string {
    if (this.samples.length === 0) {
      return '0.000';
    }
    const sum = this.samples.reduce((a, b) => a + b);
    return ((sum / this.samples.length) / Math.pow(10, 6)).toFixed(3);
  }

  public measureFn<T>(fn: () => T): T;
  public measureFn<T>(fn: () => Promise<T>): Promise<T>;
  public measureFn<T>(fn: () => T | Promise<T>): T | Promise<T> {
    const timer = this;
    timer.start();
    const fnReturnData = fn();
    
    if (fnReturnData && typeof fnReturnData === 'object' && 'then' in fnReturnData) {
      return (fnReturnData as Promise<T>).then((retVal) => {
        timer.end();
        return retVal;
      });
    } else {
      timer.end();
      return fnReturnData as T;
    }
  }
}
