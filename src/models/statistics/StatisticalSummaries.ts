import {Quartiles} from "./Quartiles";

export interface StatisticalSummaries {
    mean: number;
    median: number;
    mode: number[];
    min: number;
    max: number;
    quartiles: Quartiles;
    standardDeviation: number;
    sum: number;
    variance: number;
}