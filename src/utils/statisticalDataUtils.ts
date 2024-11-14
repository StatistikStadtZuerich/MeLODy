import {StatisticalSummaries} from "../models/statistics/StatisticalSummaries";
import {Quartiles} from "../models/statistics/Quartiles";

export const createStatisticalSummaries = (numbers: number[]): StatisticalSummaries => ({
    mean: mean(numbers),
    median: median(numbers),
    mode: mode(numbers),
    sum: sum(numbers),
    ...range(numbers),
    quartiles: quartiles(numbers),
    standardDeviation: standardDeviation(numbers),
    variance: variance(numbers)
})

function sum(numbers: number[]): number {
    return numbers.reduce((acc, num) => acc + num, 0);
}

function sumOfSquares(numbers: number[]): number {
    return sum(numbers.map(num => num * num));
}

function variance(numbers: number[]): number {
    const meanNumber = mean(numbers);
    return sumOfSquares(numbers) / numbers.length - meanNumber * meanNumber;
}

/**
 * Calculate the mean (average) of an array of numbers.
 * @param numbers - Array of numbers.
 * @returns The mean of the numbers.
 */
function mean(numbers: number[]): number {
    const total = numbers.reduce((acc, num) => acc + num, 0);
    return total / numbers.length;
}

/**
 * Calculate the median of an array of numbers.
 * @param numbers - Array of numbers.
 * @returns The median of the numbers.
 */
function median(numbers: number[]): number {
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sortedNumbers.length / 2);

    if (sortedNumbers.length % 2 === 0) {
        return (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
    } else {
        return sortedNumbers[mid];
    }
}

/**
 * Calculate the mode of an array of numbers.
 * @param numbers - Array of numbers.
 * @returns The mode of the numbers.
 */
function mode(numbers: number[]): number[] {
    const frequency: Record<number, number> = {};
    let maxFreq = 0;

    numbers.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
        if (frequency[num] > maxFreq) {
            maxFreq = frequency[num];
        }
    });

    return Object.keys(frequency)
        .filter(key => frequency[Number(key)] === maxFreq)
        .map(Number);
}

/**
 * Calculate the standard deviation of an array of numbers.
 * @param numbers - Array of numbers.
 * @returns The standard deviation of the numbers.
 */
function standardDeviation(numbers: number[]): number {
    const meanValue = mean(numbers);
    const variance = mean(numbers.map(num => Math.pow(num - meanValue, 2)));
    return Math.sqrt(variance);
}

/**
 * Calculate the quartiles of an array of numbers.
 * @param numbers - Array of numbers.
 * @returns An object containing the first quartile (Q1), second quartile (Q2/median), and third quartile (Q3).
 */
function quartiles(numbers: number[]): Quartiles {
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const q2 = median(sortedNumbers);
    const lowerHalf = sortedNumbers.slice(0, Math.floor(sortedNumbers.length / 2));
    const upperHalf = sortedNumbers.slice(Math.ceil(sortedNumbers.length / 2));

    const q1 = median(lowerHalf);
    const q3 = median(upperHalf);

    return {q1, q2, q3};
}

/**
 * Calculate the range and return the min and max of an array of numbers.
 * @param numbers - Array of numbers.
 * @returns An object containing the min and max of the numbers.
 */
function range(numbers: number[]): { min: number, max: number } {
    const maxNumber = Math.max(...numbers);
    const minNumber = Math.min(...numbers);
    return {min: minNumber, max: maxNumber};
}
