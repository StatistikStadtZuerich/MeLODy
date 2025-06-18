import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

export function getFertilityData(): DatasetIdWithQuery {
    return {
        id: 'fertility_jahr_alter_heimat',
        file: 'src/data/fertility/Daten_GeburtenFertilitaet_Jahr-Alter-Heimat.csv.zip'
    };
}

export function getFertilityGeburtenzifferJahrData(): DatasetIdWithQuery {
    return {
        id: 'fertility_geburtenziffer_jahr',
        file: 'src/data/fertility/Daten_Geburtenziffer_Jahr.csv.zip'
    };
}

export function getFertilityGeburtenzifferJahrHerkunftMutterData(): DatasetIdWithQuery {
    return {
        id: 'fertility_geburtenziffer_jahr_herkunft_mutter',
        file: 'src/data/fertility/Daten_Geburtenziffer_Jahr_Herkunft_Mutter.csv.zip'
    };
}

export function getFertilityJahrData(): DatasetIdWithQuery {
    return {
        id: 'fertility_jahr',
        file: 'src/data/fertility/Daten_Jahr.csv.zip'
    };
}

export function getFertilityJahrAlterHerkunftMutterData(): DatasetIdWithQuery {
    return {
        id: 'fertility_jahr_alter_herkunft_mutter',
        file: 'src/data/fertility/Daten_Jahr_Alter_Herkunft_Mutter.csv.zip'
    };
}

export function getFertilityJahrAlterMutterData(): DatasetIdWithQuery {
    return {
        id: 'fertility_jahr_alter_mutter',
        file: 'src/data/fertility/Daten_Jahr_Alter_Mutter.csv.zip'
    };
}

export function getFertilityJahrHerkunftMutterData(): DatasetIdWithQuery {
    return {
        id: 'fertility_jahr_herkunft_mutter',
        file: 'src/data/fertility/Daten_Jahr_Herkunft_Mutter.csv.zip'
    };
}