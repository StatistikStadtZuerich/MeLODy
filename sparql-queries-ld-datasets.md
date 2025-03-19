# SPARQL queries für MeLODy 1.1
Für alle nachfolgenden queries werden diese prefixe verwendet:

```sparql
PREFIX cube: <https://cube.link/>
PREFIX schema: <https://schema.org/>
PREFIX sszP: <https://ld.stadt-zuerich.ch/statistics/property/>
PREFIX sszM: <https://ld.stadt-zuerich.ch/statistics/measure/>
PREFIX sszTS: <https://ld.stadt-zuerich.ch/statistics/termset/>
```

### Bevölkerung der Stadt Zürich nach Jahr
PupulationData (BEV324OD3243 / Cube000201)

```sparql
SELECT (year(?Datum) AS ?Jahr) ?Wirtschaftliche_Wohnbevoelkerung WHERE {
  <https://ld.stadt-zuerich.ch/statistics/000201/observation> cube:observation [
  		sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
		sszP:TIME ?Datum;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung;
    	sszP:RAUM <https://ld.stadt-zuerich.ch/statistics/code/R30000>
  ]
} 
ORDER BY ?Jahr
```

## Mietpreise in der Stadt Zürich
MitpreisData (BAU516OD5161): *Nicht als Linked Data verfügbar*

## Beschäftigte in Zürich nach Beschäftigungsgrad pro Quartal (ab 2003)
EmploymentData (WIR400OD4004 / Cube800022)

```sparql
SELECT ?Datum_nach_Quartal ?Beschaeftigungsgrad ?Anzahl_Beschaeftigte WHERE {
  <https://ld.stadt-zuerich.ch/statistics/800022/observation> cube:observation [
  		sszP:ZEIT/schema:inDefinedTermSet sszTS:Quartal;
		sszP:TIME ?Datum_nach_Quartal;
		sszP:BEG/schema:name ?Beschaeftigungsgrad;
        sszM:BBS ?Anzahl_Beschaeftigte
  ]
} 
ORDER BY ?Datum_nach_Quartal ?Beschaeftigungsgrad
```
