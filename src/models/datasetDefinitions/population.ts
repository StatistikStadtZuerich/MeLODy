import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

const query = `SELECT (year(?Datum) AS ?Jahr) ?Wirtschaftliche_Wohnbevoelkerung WHERE {
  <https://ld.stadt-zuerich.ch/statistics/000201/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:TIME ?Datum;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung;
        sszP:RAUM <https://ld.stadt-zuerich.ch/statistics/code/R30000>
  ]
} 
ORDER BY ?Jahr`;

export const populationDatasetDefinitionWithQuery: DatasetIdWithQuery = {
    id: 'population',
    sparqlQuery: query,
    source: "https://ld.integ.stzh.ch/statistics/view/BEV324OD3243"
};