import {IDataPoint} from "../models/IDataPoint";

export function farthestPointSampling<T extends IDataPoint>(data: T[], limit: number, targetClassKey: keyof T, targetClassValue: any): T[] {
    const filteredData = data.filter((point: T) => point[targetClassKey] === targetClassValue);

    if (filteredData.length <= limit) {
        return filteredData;
    }

    const selectedPoints: T[] = [];
    const firstPoint = filteredData[Math.floor(Math.random() * filteredData.length)];
    selectedPoints.push(firstPoint);

    let candidates = filteredData.filter((item: T) => item !== firstPoint);

    while (selectedPoints.length < limit) {
        let maxDistance = -Infinity;
        let nextPoint: T | null = null;

        for (const candidate of candidates) {
            const minDistance = Math.min(
                ...selectedPoints.map((p: T) => euclideanDistance(p, candidate))
            );

            if (minDistance > maxDistance) {
                maxDistance = minDistance;
                nextPoint = candidate;
            }
        }

        if (nextPoint) {
            selectedPoints.push(nextPoint);
            candidates = candidates.filter((item: T) => item !== nextPoint);
        } else {
            break;
        }
    }

    return selectedPoints;
}

function euclideanDistance<T extends IDataPoint>(a: T, b: T): number {
    const keys = Object.keys(a).filter(key => key !== 'class' && key !== '_id');
    let sum = 0;
    for (const key of keys) {
        const aValue = parseFloat(a[key]);
        const bValue = parseFloat(b[key]);
        const diff = aValue - bValue;
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}