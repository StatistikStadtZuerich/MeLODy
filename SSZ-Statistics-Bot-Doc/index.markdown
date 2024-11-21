---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

# MeLODy

## Überblick

**Projektname:** MeLODy

Das Projekt MeLODy ist darauf ausgelegt, einen LLM Bot wie ChatGPT mit einer API zu verbinden. Der Bot
übersetzt Benutzeranfragen in API-Anfragen, welche daraufhin die Daten verarbeiten und zurücksenden. ChatGPT analysiert
die Antwort, übersetzt sie in verständliche Worte und kann damit weiterarbeiten.

[Link to ChatGPT Bot](https://chatgpt.com/g/g-673daf7008ac819180b306f2e2c3f802-ssz-statistics-bot-v2-0)

## Optimierung für ChatGPT

Damit ChatGPT effektiv arbeiten kann, sind klare und präzise Endpunkte und Parameter erforderlich. Hier sind einige
Erfahrungen und Best Practices, um die Zusammenarbeit mit ChatGPT zu optimieren:

- **CSV-Dateien:** ChatGPT kann CSV-Dateien am besten analysieren.
- **Eindeutige Anweisungen:** Verwenden Sie Formulierungen wie „based on the dataset“ und „avoid assumptions“. Es sollte
  auch „NEVER ever create sample data“ verwendet werden, um die Erstellung von Beispieldaten zu verhindern.
- **Trends und Grafiken:** Bei Fragen zu Trends antwortet ChatGPT oft mit Grafiken. Wenn eine textbasierte Antwort
  gewünscht ist, sollte dies ausdrücklich betont werden.
- **Weniger Parameter:** Weniger Parameter sind besser. Geben Sie so viele Leitplanken wie möglich, damit sich ChatGPT
  nicht verirrt.
- **Mehr Routen:** Mehr Routen mit einfachen und klar definierten Parametern sind optimal. Je simpler, desto besser.
- **Exakte Routen:** Vermeiden Sie dynamische Subrouten. Es müssen genaue Routen mit eng geschnittenen Parametern sein,
  um Interpretationsspielraum zu vermeiden.
- **Swagger-Beschreibungen:** Die Beschreibungen in der Swagger-Datei sollten immer auf Englisch sein, da ChatGPT dies
  am besten verstehen kann.
- **Daten Kompaktheit:** ChatGPT kann keine riesigen Datensätze analysieren. Die maximale Anzahl an JSON-Objekten sind ~
  1000 Zeilen. Auch Listen und Zahlen sollten sich begrenzt halten. ChatGPT neigt dazu, die letzten paar Werte zu nehmen
  und für die Antwort anzupassen, wie es will. Präzise Zahlen werden benötigt.

## Beispielanfragen

Hier sind einige Beispielanfragen, die gut funktionieren:

1. **Wie hat sich die Bevölkerung von Zürich in den letzten 100 Jahren entwickelt? Zeige mir einen Graphen davon.**
2. **Zeige mir die Geschlechterverteilung über die Jahre.**
3. **Zeige den Unterschied zwischen Einheimischen und Ausländern zwischen den Geschlechtern über die Jahre.**
4. **Zeige mir die Altersverteilung von diesem Jahr.**
5. **Wie hat sich die Anzahl an Kindern über die letzten 30 Jahren verändert?**
6. **Zeige mir einen Graphen wie sich die Anzahl an Wohnungen über die letzten Jahre verändert haben.**
7. **Wie hat sich das Einkommen über die letzten Jahre entwickelt?**
8. **Wie haben sich die Mieten in Quartier XY entwickelt?**
9. **Wie hat sich die Anzahl der Beschäftigten über die letzten Jahre verändert?**

## Wie die Datenerfassung funktioniert

Um zu verstehen, wie der MeLODy Bot Daten verarbeitet und zurückgibt, finden Sie hier eine
Schritt-für-Schritt-Erklärung:

1. **Transformieren der Anfrage:**
    - Die API transformiert den Anfrage-Body oder die Query-Parameter in ein Anfrage-Body-Objekt. Dieses Objekt enthält
      datasetspezifische Filtereigenschaften und, falls zutreffend, ein `groupBy` Feld. Verfügbare Felder der Datensätze
      können verwendet werden, um die zurückgegebenen Daten zu gruppieren.

2. **Filtern der Daten:**
    - Die API filtert die Daten basierend auf den angegebenen Filterparametern. Dies stellt sicher, dass nur relevante
      Daten abgerufen werden, die den festgelegten Kriterien entsprechen.

3. **Gruppieren der Daten:**
    - Die gefilterten Daten werden dann in einem Objekt gruppiert. Die Gruppierung basiert auf den Feldern, die im
      `groupBy` Parameter angegeben sind, wodurch strukturierte und kategorisierte Datenresultate ermöglicht werden.
4. **Summierung mancher Daten**
    - Da bestimmte Datentypen wie Demographiedaten oder Wohnungsdaten leicht summierbar sind, ohne die Werte zu
      verfälschen, werden solche Daten summiert, um die Verarbeitung durch ChatGPT zu erleichtern.
    - Ursprünglich sollte eine statistische Zusammenfassung in folgenden Werten erfolgen:
        - **Mittelwert (mean)**
        - **Median**
        - **Modus (mode)**
        - **Summe (sum)**
        - **Minimum (min)**
        - **Maximum (max)**
        - **Quartile**
        - **Standardabweichung (standardDeviation)**
        - **Varianz**

   Diese Transformationen sind jedoch nur bei absoluten Werten oder Ergebnissen möglich und nicht bei zuvor
   transformierten Daten. Daher wurde der Algorithmus entfernt. Stattdessen wird eine gut gruppierte Datenstruktur für
   nicht summierbare Daten zurückgesendet.

5. **Antwortstruktur:**
    - Die Antwort von der API enthält:
        - Eine Liste der Felder, sortiert nach der Gruppenreihenfolge.
        - Die Gesamtanzahl der Daten.
        - Die Originaldatenquelle.
        - Das Datenresultat selbst, entweder summiert oder gruppiert, für eine effiziente und qualitativ hochwertige
          Analyse durch den Bot.

Durch das Befolgen dieser Schritte stellt der MeLODy Bot eine effiziente Datenverarbeitung sicher und
liefert strukturierte, aussagekräftige Ergebnisse, die leicht von ChatGPT interpretiert werden können.

## Verbesserte Datenformate zur Optimierung von Anfragen und effizienteren Analysen mit ChatGPT

### Demografie

| Jahr (Number) | Kreis (Number) | Quartier (Affoltern - String) | Herkunft (Schweiz/Ausland) | Geschlecht (M/F) | Alter (Number) | Einwohner (Number) |
|---------------|----------------|-------------------------------|----------------------------|------------------|----------------|--------------------|

### Wohnungen

| Jahr (Number) | Kreis (Number) | Quartier (Affoltern - String) | Eigentümer (Öffentlich/Genossenschaft/Privat/Natürliche Person) | Zimmeranzahl (Number) | Anzahl (Number) |
|---------------|----------------|-------------------------------|-----------------------------------------------------------------|-----------------------|-----------------|

### Erwerbstätige

| Jahr (Number) | Quartal (Number) | Anzahl (Number) | Vollzeit (Number) |
|---------------|------------------|-----------------|-------------------|

### Miete

| Jahr (Number) | Raum (Ganze Stadt/Kreise/Quartiere) | Zimmeranzahl (Number) | Gemeinnützig (Ja/Nein) | Messung (Wohnung/m²) | Preisart (Brutto/Netto) | Preis (Number) |
|---------------|-------------------------------------|-----------------------|------------------------|----------------------|-------------------------|----------------|

### Einkommenssteuer

| Jahr (Number) | Quartier (Affoltern - String) | Tarif (Grundtarif/Einzeltarif/Verheiratetentarif) | Einkommenssteuer (Number) |
|---------------|-------------------------------|---------------------------------------------------|---------------------------|

## API-Dokumentation

### API-Informationen

- **Titel:** SSZ ChatGPT Prototype
- **Version:** 1.0.0
- **Beschreibung:** API description
- **Basis-URL:** /api/v2

### Verfügbare Endpunkte und Parameter

#### POST /apartments

- **Zusammenfassung:** Filter and group apartment data
- **OperationID:** filterAndGroupApartmentData
- **Anfrage-Body:**
  ```json
  {
    "startYear": 2000,
    "endYear": 2020,
    "area": "Altstadt",
    "rooms": 3,
    "priceMin": 1000,
    "priceMax": 3000,
    "groupBy": ["area", "rooms"]
  }
  ```
    - **Beschreibung der Felder:**
        - `startYear`: Startjahr für die Filterung der Daten.
        - `endYear`: Endjahr für die Filterung der Daten.
        - `area`: Der Bereich für die Filterung der Daten.
        - `rooms`: Die Anzahl der Zimmer für die Filterung der Daten.
        - `priceMin`: Mindestpreis für die Filterung der Daten.
        - `priceMax`: Höchstpreis für die Filterung der Daten.
        - `groupBy`: Ein oder mehrere Schlüssel zum Gruppieren der Ergebnisse (z.B. area, rooms).

- **Antworten:**
    - **200:** Erfolgreich gefilterte und gruppierte apartment data
      ```json
      {
        "keys": ["string"],
        "total": "integer",
        "result": {},
        "source": "string"
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter oder keine Gruppierung angegeben

#### POST /demographics

- **Zusammenfassung:** Retrieve demographic data with filtering and grouping
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
        "total": "integer",
        "source": "string"
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter oder keine Gruppierung angegeben

#### POST /employment

- **Zusammenfassung:** Filter and group employment data
- **OperationID:** filterAndGroupEmploymentData
- **Anfrage-Body:**
  ```json
  {
    "startYear": 2000,
    "endYear": 2020,
    "industry": "Information Technology",
    "minEmployees": 10,
    "maxEmployees": 5000,
    "groupBy": ["industry", "year"]
  }
  ```
    - **Beschreibung der Felder:**
        - `startYear`: Startjahr für die Filterung der Daten.
        - `endYear`: Endjahr für die Filterung der Daten.
        - `industry`: Branche für die Filterung der Daten.
        - `minEmployees`: Mindestanzahl an Mitarbeitern für die Filterung der Daten.
        - `maxEmployees`: Höchstanzahl an Mitarbeitern für die Filterung der Daten.
        - `groupBy`: Ein oder mehrere Schlüssel zum Gruppieren der Ergebnisse (z.B. industry, year).

- **Antworten:**
    - **200:** Erfolgreich gefilterte und gruppierte Beschäftigungsdaten
      ```json
      {
        "keys": ["string"],
        "total": "integer",
        "result": {},
        "source": "string"
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter

#### POST /income

- **Zusammenfassung:** Retrieve grouped income data based on filters and grouping parameters
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
        "total": "integer",
        "source": "string"
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter oder keine Unterrouten angegeben
    - **500:** Interner Serverfehler

#### GET /population

- **Zusammenfassung:** Retrieve population data based on various filters like year, startYear, endYear, minPopulation,
  and maxPopulation.
- **OperationID:** getPopulationNumbers
- **Parameter:**
    - `year` (Query, string): Filter nach spezifischem Jahr
    - `startYear` (Query, string): Filter nach Startjahr
    - `endYear` (Query, string): Filter nach Endjahr
    - `minPopulation` (Query, number): Mindestbevölkerung Filter
    - `maxPopulation` (Query, number): Maximalbevölkerung Filter

- **Antworten:**
    - **200:** Erfolgreich abgerufene Bevölkerungsdaten
      ```json
      {
        "total": "integer",
        "returned": "integer",
        "data": []
      }
      ```
    - **404:** Keine Daten für die angegebenen Parameter
    - **500:** Interner Serverfehler

## Nächste Schritte

In den nächsten Schritten werden wir versuchen, unseren aktuellen Ansatz zu nutzen, um automatisch Anfrageschnittstellen
basierend auf Nutzereingaben und gegebenen Daten-Schemata wie SHACL zu erstellen. Hierbei soll ChatGPT herausfinden,
welche Datenfelder notwendig sind, um präzise Ergebnisse für das Filtern und Gruppieren der Daten zu liefern.

### Automatisierte Erstellung von Anfrageschnittstellen

1. **Nutzereingaben analysieren**:
    - ChatGPT wird die Eingaben der Nutzer analysieren und daraus ableiten, welche Informationen für die Anfrage
      relevant sind.
    - Beispiel: Wenn ein Benutzer nach Einkommensverteilung in einem bestimmten Bezirk fragt, wird ChatGPT Felder wie
      `startYear`, `endYear`, `district`, `taxCategory` usw. identifizieren.

2. **Daten-Schemata einbinden**:
    - Wir werden bestehende Daten-Schemata wie SHACL (Shapes Constraint Language) verwenden, um sicherzustellen, dass
      die erstellten Anfragen den Datenanforderungen entsprechen.
    - SHACL wird genutzt, um die Struktur und die erforderlichen Felder der Daten zu validieren.

3. **Automatische Feldermittlung**:
    - Basierend auf den Daten-Schemata und den Anfragen des Nutzers wird ChatGPT automatisch die notwendigen Datenfelder
      für das Filtern und Gruppieren bestimmen.
    - Beispiel: Für eine Anfrage zur Demographie von Zürich könnte ChatGPT Felder wie `startYear`, `endYear`, `age`,
      `gender`, `district` usw. identifizieren.

4. **Schnittstellenerstellung**:
    - ChatGPT generiert automatisch die Anfrageschnittstellen einschließlich der entsprechenden Felder und Parameter.
    - Diese Schnittstellen werden in einer standardisierten Form (z.B. JSON) erstellt und können direkt in der API
      verwendet werden.

5. **Integration und Tests**:
    - Die generierten Schnittstellen werden in die bestehende API integriert.
    - Es werden umfassende Tests durchgeführt, um sicherzustellen, dass die Anfragen korrekt verarbeitet werden und
      präzise Antworten liefern.

Durch diesen automatisierten Ansatz können wir sicherstellen, dass die Anfragen der Nutzer so präzise und effizient wie
möglich bearbeitet werden. Gleichzeitig wird der Entwicklungsaufwand reduziert, da ChatGPT die notwendigen Schritte
automatisiert und optimiert.

### Vorteile des automatisierten Ansatzes

- **Effizienz**: Automatisierte Identifikation der notwendigen Datenfelder reduziert den manuellen Aufwand.
- **Genauigkeit**: Präzisere Anfragen führen zu genaueren und relevanteren Antworten.
- **Flexibilität**: Der Ansatz kann leicht an unterschiedliche Daten-Schemata und Benutzeranfragen angepasst werden.
- **Skalierbarkeit**: Ermöglicht die schnelle Integration neuer Datenquellen und Anfragetypen.

Dieser nächste Schritt ist ein bedeutender Fortschritt in Richtung einer vollautomatisierten und intelligenten
Datenerfassungs- und Verarbeitungslösung, die auf die Bedürfnisse der Nutzer zugeschnitten ist.

## Fazit

Der MeLODy Bot bietet eine effiziente Möglichkeit, Anfragen von Nutzern in strukturierte API-Anfragen zu
übersetzen, die Daten zu transformieren und sie in verständlicher Form zurückzugeben. Die automatische
Swagger-Dokumentation erleichtert Entwicklern den Einstieg und die Nutzung der API. Durch die Einhaltung der oben
genannten Optimierungen kann die Zusammenarbeit mit ChatGPT weiter verbessert werden.

Der nächste Schritt in der Entwicklung wird darin bestehen, unseren aktuellen Ansatz zu nutzen, um automatisch
Anfrageschnittstellen basierend auf Nutzereingaben und gegebenen Daten-Schemata wie SHACL zu erstellen. ChatGPT wird
hierbei die notwendigen Datenfelder für das Filtern und Gruppieren identifizieren, um die Anfragen präzise und effizient
zu beantworten.

Dadurch wird der MeLODy Bot nicht nur benutzerfreundlicher, sondern auch flexibler und skalierbarer für
zukünftige Erweiterungen. Die Integration und Automatisierung dieser Prozesse reduziert den manuellen Aufwand und erhöht
die Genauigkeit und Relevanz der Antworten, was zu einem insgesamt verbesserten Nutzungserlebnis führt.