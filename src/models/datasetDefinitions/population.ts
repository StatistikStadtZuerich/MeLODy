import {DatasetIdWithQuery} from "../DatasetIdWithQuery";
import {DATA_SOURCE_BASE_URL} from "../../server";

const query = `SELECT (year(?Datum) AS ?Jahr) ?Wirtschaftliche_Wohnbevoelkerung WHERE {
  <https://ld.stadt-zuerich.ch/statistics/000201/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:TIME ?Datum;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung;
        sszP:RAUM <https://ld.stadt-zuerich.ch/statistics/code/R30000>
  ]
} 
ORDER BY ?Jahr`;

export function getPopulationDatasetDefinitionWithQuery(): DatasetIdWithQuery {
    return {
        id: 'population',
        sparqlQuery: query,
        source: `${DATA_SOURCE_BASE_URL}BEV324OD3243`
    };
}
