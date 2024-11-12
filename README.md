# Projekt SSZ Statistics Bot V1.0

## Überblick

**Projektname:** Project SSZ Statistics Bot V1.0

Das Projekt SSZ Statistics Bot V1.0 ist darauf ausgelegt, einen LLM Bot wie ChatGPT mit einer API zu verbinden. Der Bot
übersetzt Benutzeranfragen in API-Anfragen, welche daraufhin die Daten verarbeiten und zurücksenden. ChatGPT analysiert
die Antwort, übersetzt sie in verständliche Worte und kann damit weiterarbeiten.

## Optimierung für ChatGPT

Damit ChatGPT effektiv arbeiten kann, sind klare und präzise Endpunkte und Parameter erforderlich. Hier sind einige
Erfahrungen und Best Practices, um die Zusammenarbeit mit ChatGPT zu optimieren:

- **CSV-Dateien:** ChatGPT kann CSV-Dateien am besten analysieren.
- **Eindeutige Anweisungen:** Verwenden Sie Formulierungen wie „based on the dataset“ und „avoid assumptions“. Es sollte
  auch „NEVER ever create sample data“ verwendet werden, um die Erstellung von Beispieldaten zu verhindern.
- **Trends und Grafiken:** Bei Fragestellungen zu Trends antwortet ChatGPT oft mit Grafiken. Wenn eine textbasierte
  Antwort gewünscht ist, sollte dies ausdrücklich betont werden.
- **Weniger Parameter:** Weniger Parameter sind besser. Geben Sie so viele Leitplanken wie möglich, damit sich ChatGPT
  nicht verirrt.
- **Mehr Routen:** Mehr Routen mit einfachen und klar definierten Parametern sind optimal. Je simpler, desto besser.
- **Gedankengang:** Es kann hilfreich sein, einen Gedankengang (Train of Thought) anzugeben.
- **Exakte Routen:** Vermeiden Sie dynamische Subrouten. Es müssen genaue Routen mit eng geschnittenen Parametern sein,
  um Interpretationsspielraum zu vermeiden.
- **Swagger-Beschreibungen:** Die Beschreibungen in der Swagger-Datei sollten immer auf Englisch sein, da ChatGPT dies
  am besten verstehen kann.

## Beispielanfragen

Hier sind einige Beispielanfragen, die gut funktionieren:

1. **Wie hat sich die Bevölkerung von Zürich in den letzten 100 Jahren entwickelt? Zeige mir einen Graphen davon.**
2. **Zeige mir die Geschlechterverteilung über die Jahre.**
3. **Zeige den Unterschied zwischen Einheimischen und Ausländern zwischen den Geschlechtern über die Jahre.**
4. **Zeige mir die Altersverteilung von diesem Jahr.**

## API-Dokumentation

### API-Informationen

- **Titel:** SSZ ChatGPT Prototype
- **Version:** 1.0.0
- **Beschreibung:** API description
- **Basis-URL:** [https://dc61-185-165-60-71.ngrok-free.app/api/v1](https://dc61-185-165-60-71.ngrok-free.app/api/v1)

### Verfügbare Endpunkte und Parameter

#### POST /demographics

- **Zusammenfassung:** Abrufen von demographischen Daten mit Filterung und Gruppierung
- **OperationID:** getDemographicData
- **Anfrage-Body:**
  ```json
  {
    "startYear": 2000,
    "endYear": 2020,
    "year": 2010,
    "sex": "M",
    "minAge": 18,
    "maxAge": 65,
    "age": 30,
    "kreis": 1,
    "quar": "Altstadt",
    "herkunft": "Schweizer*in",
    "groupBy": ["AlterVKurz", "SexLang"]
  }
  ```
    - **Beschreibung der Felder:**
        - `startYear`: Das Startjahr für die Filterung der Daten.
        - `endYear`: Das Endjahr für die Filterung der Daten.
        - `year`: Ein spezifisches Jahr für die Filterung der Daten.
        - `sex`: Geschlecht für die Datenfilterung (M oder F).
        - `minAge`: Mindestalter für die Filterung der Daten.
        - `maxAge`: Höchstalter für die Filterung der Daten.
        - `age`: Spezifisches Alter für die Filterung der Daten.
        - `kreis`: Der Bezirk für die Filterung der Daten.
        - `quar`: Das Quartier für die Filterung der Daten.
        - `herkunft`: Herkunft für die Datenfilterung (z.B. Schweizer*in, Ausländer*in).
        - `groupBy`: Ein Schlüssel von DemographicData, um die Ergebnisse zu gruppieren (z.B. AlterVKurz, SexLang).

- **Antworten:**
    - **200:** Erfolgreich abgerufene und gruppierte demographische Daten
      ```json
      {
        "result": {},
        "keys": ["string"],
        "total": "integer"
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter oder keine Gruppierung angegeben

#### GET /income

- **Zusammenfassung:** Abrufen von Einkommensdaten mit Filterung
- **OperationID:** getIncomeData
- **Parameter:**
    - `startYear` (Query, string): Startjahr für den Zeitrahmenfilter
    - `endYear` (Query, string): Endjahr für den Zeitrahmenfilter
    - `year` (Query, string): Filter nach spezifischem Jahr
    - `district` (Query, string): Filter nach Bezirksnamen
    - `taxCategory` (Query, string): Filter nach Steuerkategorie
    - `minMedianIncome` (Query, number): Mindestmedian Einkommen Filter
    - `maxMedianIncome` (Query, number): Maximales Median Einkommen Filter
    - `minIncomeP25` (Query, number): Mindest Einkommen im 25. Perzentil
    - `maxIncomeP75` (Query, number): Maximal Einkommen im 75. Perzentil
    - `sortBy` (Query, string): Sortierfeld
    - `sortAsc` (Query, boolean): Sortierung aufsteigend (true) oder absteigend (false)
- **Antworten:**
    - **200:** Eine Liste von Einkommensdaten
      ```json
      {
        "total": "integer",
        "returned": "integer",
        "data": []
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter
    - **500:** Interner Serverfehler

#### POST /income

- **Zusammenfassung:** Abrufen von gruppierten Einkommensdaten basierend auf Filtern und Gruppierungsparametern
- **OperationID:** postIncomeData
- **Anfrage-Body:**
  ```json
  {
    "startYear": 2000,
    "endYear": 2020,
    "year": 2010,
    "quar": "Altstadt",
    "tarif": "Standard",
    "taxIncome_p50": 60000,
    "taxIncome_p25": 40000,
    "taxIncome_p75": 80000,
    "groupBy": ["year", "quar"]
  }
  ```
    - **Beschreibung der Felder:**
        - `startYear`: Startjahr für die Einkommensdaten.
        - `endYear`: Endjahr für die Einkommensdaten.
        - `year`: Spezifisches Jahr für die Einkommensdaten.
        - `quar`: Viertel für die Einkommensdaten.
        - `tarif`: Steuertarif.
        - `taxIncome_p50`: Medianeinkommen.
        - `taxIncome_p25`: Einkommen des 25. Perzentils.
        - `taxIncome_p75`: Einkommen des 75. Perzentils.
        - `groupBy`: Kriterien zur Gruppierung (z.B. year, quar).

- **Antworten:**
    - **200:** Ein gruppiertes Set an Einkommensdaten
      ```json
      {
        "keys": ["string"],
        "result": {},
        "total": "integer"
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter oder keine Unterrouten angegeben
    - **500:** Interner Serverfehler

#### GET /population

- **Zusammenfassung:** Abrufen von Bevölkerungsdaten basierend auf verschiedenen Filtern wie Jahr, startYear, endYear,
  minPopulation und maxPopulation.
- **OperationID:** getPopulationNumbers
- **Parameter:**
    - `year` (Query, string): Filter nach spezifischem Jahr
    - `startYear` (Query, string): Filter nach Startjahr
    - `endYear` (Query, string): Filter nach Endjahr
    - `minPopulation` (Query, number): Mindestbevölkerung Filter
    - `maxPopulation` (Query, number): Maximalbevölkerung Filter
- **Antworten:**
    - **200:** Erfolgreich abgerufene Bevölkerungsdaten
    - **404:** Keine Daten für die angegebenen Parameter
    - **500:** Interner Serverfehler

## Fazit

Der SSZ Statistics Bot V1.0 bietet eine effiziente Möglichkeit, Anfragen von Nutzern in strukturierte API-Anfragen zu
übersetzen, die Daten zu transformieren und sie in verständlicher Form zurückzugeben. Die automatische
Swagger-Dokumentation erleichtert Entwicklern den Einstieg und die Nutzung der API. Durch die Einhaltung der oben
genannten Optimierungen kann die Zusammenarbeit mit ChatGPT weiter verbessert werden.