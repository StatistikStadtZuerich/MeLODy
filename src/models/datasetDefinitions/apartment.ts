import {DatasetDefinition, DatasetDefinitionWithSparqlQuery} from "../DatasetDefinition";

const apartmentsDatasetDefinition: DatasetDefinition = {
    id: 'apartments',
    title: 'Zurich Apartments Data',
    description: 'Apartment statistics for Zurich by district, rooms, ownership type, and construction period',
    fields: [
        {
            name: 'year',
            description: 'Year of observation',
            type: 'number'
        },
        {
            name: 'district',
            description: 'City district (Stadtquartier)',
            type: 'string'
        },
        {
            name: 'rooms',
            description: 'Number of rooms (Zimmerzahl)',
            type: 'string'
        },
        {
            name: 'ownershipType',
            description: 'Type of ownership (Eigentumsart)',
            type: 'string'
        },
        {
            name: 'constructionPeriod',
            description: 'Construction period (Bauperiode)',
            type: 'string'
        },
        {
            name: 'rentOrOwn',
            description: 'Property is for rent or ownership (Miete_oder_Eigentum)',
            type: 'string'
        },
        {
            name: 'apartmentCount',
            description: 'Number of apartments (Anzahl_Wohnungen)',
            type: 'number'
        }
    ],
    filters: [
        {field: 'year', type: 'exact'},
        {field: 'district', type: 'multi-select'},
        {field: 'rooms', type: 'multi-select'},
        {field: 'ownershipType', type: 'multi-select'},
        {field: 'constructionPeriod', type: 'multi-select'},
        {field: 'rentOrOwn', type: 'exact'}
    ],
    multiSelectOptions: {
        district: [
            "Altstetten", "Aussersihl", "City", "Enge", "Escher Wyss", "Fluntern",
            "Friesenberg", "Gewerbeschule", "Hochschulen", "Höngg", "Hottingen",
            "Leimbach", "Lindenhof", "Mühlebach", "Oberstrass", "Oerlikon",
            "Rathaus", "Schwamendingen-Mitte", "Seebach", "Seefeld", "Sihlfeld",
            "Unterstrass", "Wiedikon", "Wipkingen", "Wollishofen"
        ],
        rooms: ["1", "2", "3", "4", "5+"],
        ownershipType: [
            "Privatperson", "Genossenschaft", "Öffentliche Hand", "Andere juristische Person"
        ],
        constructionPeriod: [
            "vor 1919", "1919-1945", "1946-1960", "1961-1970", "1971-1980",
            "1981-1990", "1991-2000", "2001-2010", "2011-2020", "ab 2021"
        ]
    }
};

const query = `SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Zimmerzahl ?Eigentumsart ?Bauperiode ?Miete_oder_Eigentum (xsd:integer(?Anzahl_Wohnungen_decimal) AS ?Anzahl_Wohnungen) WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000579/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:ZIM/schema:name ?Zimmerzahl;
        sszP:EIG/schema:name ?Eigentumsart;
        sszP:BAP/schema:name ?Bauperiode;
        sszP:MWF ?Mietflag;
        sszM:WHG ?Anzahl_Wohnungen_decimal
    ]
    BIND(IF(?Mietflag = <https://ld.stadt-zuerich.ch/statistics/code/MWF0001>, "Miete", "Eigentum") AS ?Miete_oder_Eigentum)
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Stadtquartier ?Zimmerzahl ?Eigentumsart ?Bauperiode ?Miete_oder_Eigentum`;

export const apartmentDatasetDefinitionWithQuery: DatasetDefinitionWithSparqlQuery = {
    definition: apartmentsDatasetDefinition,
    sparqlQuery: query
};