"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ml_kmeans_1 = require("ml-kmeans");
function kMeansSampling(data, limit, targetClassKey, targetClass) {
    const filteredData = targetClass ? data.filter((point) => point[targetClassKey] === targetClass) : data;
    if (filteredData.length <= limit) {
        return filteredData;
    }
    const featureKeys = Object.keys(filteredData[0]).filter(key => key !== targetClassKey && key !== '_id');
    const features = filteredData.map(point => featureKeys.map(key => parseFloat(point[key])).filter(Boolean));
    const kmeansResult = (0, ml_kmeans_1.kmeans)(features, limit, {});
    const selectedPoints = [];
    for (let i = 0; i < limit; i++) {
        const clusterIndices = kmeansResult.clusters.reduce((indices, clusterId, idx) => {
            if (clusterId === i)
                indices.push(idx);
            return indices;
        }, []);
        const centroid = kmeansResult.centroids[i];
        let minDistance = Infinity;
        let representativeIndex = -1;
        for (const idx of clusterIndices) {
            const pointFeatures = features[idx];
            const distance = euclideanDistanceArray(pointFeatures, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                representativeIndex = idx;
            }
        }
        if (representativeIndex !== -1) {
            selectedPoints.push(filteredData[representativeIndex]);
        }
    }
    return selectedPoints;
}
function euclideanDistanceArray(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}
exports.default = kMeansSampling;
