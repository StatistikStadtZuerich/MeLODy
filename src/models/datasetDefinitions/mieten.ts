import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

export function getMietData(): DatasetIdWithQuery {
    return {
        id: 'mieten',
        file: 'src/data/bau516od5161.csv.zip'
    };
}
