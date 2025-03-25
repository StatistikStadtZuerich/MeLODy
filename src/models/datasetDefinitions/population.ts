import {DatasetDefinition, DatasetDefinitionWithSparqlQuery} from "../DatasetDefinition";

const populationDatasetDefinition: DatasetDefinition = {
    id: 'population',
    title: 'Population Data',
    description: 'Economic residential population of Zurich by year',
    fields: [
        {
            name: 'Datum',
            description: 'Year of observation',
            type: 'number'
        },
        {
            name: 'Wirtschaftliche_Wohnbevoelkerung',
            description: 'Economic residential population count',
            type: 'number'
        }
    ],
    filters: [
        {field: 'year', type: 'range'}
    ]
};
const query = `SELECT (year(?Datum) AS ?Jahr) ?Wirtschaftliche_Wohnbevoelkerung WHERE {
  <https://ld.stadt-zuerich.ch/statistics/000201/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:TIME ?Datum;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung;
        sszP:RAUM <https://ld.stadt-zuerich.ch/statistics/code/R30000>
  ]
} 
ORDER BY ?Jahr`;

export const populationDatasetDefinitionWithQuery: DatasetDefinitionWithSparqlQuery = {
    definition: populationDatasetDefinition,
    sparqlQuery: query
};