import {kmeans} from 'ml-kmeans';
import {IDataPoint} from "../models/IDataPoint";


function kMeansSampling<T extends IDataPoint>(data: T[], limit: number, targetClassKey: keyof T, targetClass?: string): T[] {
    const filteredData = targetClass ? data.filter((point: T) => point[targetClassKey] === targetClass) : data;

    if (filteredData.length <= limit) {
        return filteredData;
    }

    const featureKeys: string[] = Object.keys(filteredData[0]).filter(key => key !== targetClassKey && key !== '_id');
    const features: number[][] = filteredData.map(point => featureKeys.map(key => parseFloat(point[key])).filter(Boolean));

    const kmeansResult = kmeans(features, limit, {});

    const selectedPoints: T[] = [];
    for (let i = 0; i < limit; i++) {
        const clusterIndices = kmeansResult.clusters.reduce((indices: number[], clusterId: number, idx: number) => {
            if (clusterId === i) indices.push(idx);
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

function euclideanDistanceArray(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

export default kMeansSampling;