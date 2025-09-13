import { TimerInterface } from '../src/types';
export declare class Timer implements TimerInterface {
    private label;
    private samples;
    private t0;
    constructor(label: string);
    getLabel(): string;
    start(): void;
    end(): number;
    avg(): string;
    measureFn<T>(fn: () => T): T;
    measureFn<T>(fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=Timer.d.ts.map