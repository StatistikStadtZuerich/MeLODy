"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.farthestPointSampling = farthestPointSampling;
function farthestPointSampling(data, limit, targetClassKey, targetClassValue) {
    const filteredData = data.filter((point) => point[targetClassKey] === targetClassValue);
    if (filteredData.length <= limit) {
        return filteredData;
    }
    const selectedPoints = [];
    const firstPoint = filteredData[Math.floor(Math.random() * filteredData.length)];
    selectedPoints.push(firstPoint);
    let candidates = filteredData.filter((item) => item !== firstPoint);
    while (selectedPoints.length < limit) {
        let maxDistance = -Infinity;
        let nextPoint = null;
        for (const candidate of candidates) {
            const minDistance = Math.min(...selectedPoints.map((p) => euclideanDistance(p, candidate)));
            if (minDistance > maxDistance) {
                maxDistance = minDistance;
                nextPoint = candidate;
            }
        }
        if (nextPoint) {
            selectedPoints.push(nextPoint);
            candidates = candidates.filter((item) => item !== nextPoint);
        }
        else {
            break;
        }
    }
    return selectedPoints;
}
function euclideanDistance(a, b) {
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
