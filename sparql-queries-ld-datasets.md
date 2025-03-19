# SPARQL queries für MeLODy 1.1
Für alle nachfolgenden queries werden diese prefixe verwendet:

```sparql
PREFIX cube: <https://cube.link/>
PREFIX schema: <https://schema.org/>
PREFIX sszP: <https://ld.stadt-zuerich.ch/statistics/property/>
PREFIX sszM: <https://ld.stadt-zuerich.ch/statistics/measure/>
PREFIX sszTS: <https://ld.stadt-zuerich.ch/statistics/termset/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
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

## Bevölkerung nach Stadtquartier, Herkunft, Geschlecht und Alter
DemographicData (BEV390OD3903/000238):

Wirtschaftliche Bevölkerung nach Alter (1-Jahres-Altersklasse), Herkunft und Geschlecht nach Jahr und Quartier

```sparql
SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Alter ?Heimatland ?Geschlecht ?Wirtschaftliche_Wohnbevoelkerung WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000238/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:ALT/schema:name ?Alter;
        sszP:HEL/schema:name ?Heimatland;
        sszP:SEX/schema:name ?Geschlecht;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung
    ]
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Datum_nach_Jahr ?Stadtquartier ?Alter ?Heimatland ?Geschlecht
```

## Einkommen nach Haushaltstyp und Stadtquartier
IncomeData (WIR100OD100A, 000608) / Median

Haushaltsäquivalenz-Einkommen steuerpflichtiger natürlicher Personen nach Haushaltstyp, Stadtquartier und Jahr

```sparql
SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Haushaltstyp ?Haushaltsäquivalenzeinkommen_Median_in_1000_CHF WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000608/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:HTY/schema:name ?Haushaltstyp;
        sszM:HAE ?Haushaltsäquivalenzeinkommen_Median_in_1000_CHF
    ]
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Datum_nach_Jahr ?Stadtquartier ?Haushaltstyp
```

## Wohnungsbestand nach Zimmerzahl, Miete/Eigentum, Bauperiode, Eigentumsart und Stadtquartier
ApartmentData (BAU583OD5831, 000579)

Anzahl Wohnungen nach Zimmerzahl, Eigentumsart, Bauperiode, Mietwohnung, Stadtquartier und Jahr.

```sparql
SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Zimmerzahl ?Eigentumsart ?Bauperiode ?Miete_oder_Eigentum (xsd:integer(?Anzahl_Wohnungen_decimal) AS ?Anzahl_Wohnungen) WHERE {
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
} ORDER BY ?Stadtquartier ?Zimmerzahl ?Eigentumsart ?Bauperiode ?Miete_oder_Eigentum
```
