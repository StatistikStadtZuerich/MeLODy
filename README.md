# MeLODy v1.2

Das Projekt MeLODy ist ein Proof of Concept und veranschaulicht, wie man strukturierte statistische Daten in einen
Chatbot integriert. Der Bot übersetzt dabei Benutzeranfragen in API-Anfragen, welche daraufhin die Daten verarbeiten und
zurücksenden. Der Demonstrator beruht auf ChatGPT-Plus und verwendet die Möglichkeit, diesen mit Webservices zu
verbinden.
[Link zum Bot](https://chatgpt.com/g/g-67e10b13e1b48191b4f355e55b72caae-melody-1-2)

 Video 1: Einfache Anfrage (MeLODy V1.0)                                                                                       | Video 2: Konversation (MeLODy V1.0)                                                                                          
-------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------
 [<img alt="Einfacher Demochat" width="360px" src="images%2Fmel0.preview.png" />](https://www.youtube.com/watch?v=EDwDnLiYRKU) | [<img alt="Demo-Konversation" width="360px" src="images%2Fmel1.preview.png" />](https://www.youtube.com/watch?v=Dc4dBXWYcfM) 

## Beispielanfragen

Der Bot (PoC) kann derzeit mit SQLite-basierten Daten des Statistischen Amts der Stadt Zürich arbeiten. Hier sind einige
Beispielanfragen:

1. **Wie hat sich die Bevölkerung von Zürich in den letzten 100 Jahren entwickelt? Zeige mir einen Graphen davon.**
2. **Zeige mir die Geschlechterverteilung über die Jahre.**
3. **Zeige den Unterschied zwischen Einheimischen und Ausländern zwischen den Geschlechtern über die Jahre.**
4. **Zeige mir die Altersverteilung von diesem Jahr.**
5. **Wie hat sich die Anzahl an Kindern über die letzten 30 Jahren verändert?**
6. **Wie haben sich die Geburtenraten in Zürich verändert?**
7. **Wie viele Todesfälle wurden im letzten Jahr registriert?**
8. **Wie hat sich die demografische Struktur in Zürich entwickelt?**

## Beispiel SQL-Abfragen

ChatGPT generiert aus Benutzeranfragen SQL-Abfragen wie diese:

``` sql
-- Bevölkerungsentwicklung über 100 Jahre
SELECT Jahr, SUM(Anzahl) AS Gesamtbevoelkerung 
FROM demographic 
WHERE Jahr >= 1923 AND Jahr <= 2023 
GROUP BY Jahr 
ORDER BY Jahr;

-- Geschlechterverteilung über die Jahre
SELECT Jahr, Geschlecht, SUM(Anzahl) AS Anzahl 
FROM demographic 
GROUP BY Jahr, Geschlecht 
ORDER BY Jahr;

-- Vergleich Schweizer und Ausländer nach Geschlecht
SELECT Jahr, Geschlecht, Herkunft, SUM(Anzahl) AS Anzahl 
FROM demographic 
GROUP BY Jahr, Geschlecht, Herkunft 
ORDER BY Jahr;

-- Geburtenrate nach Quartal im letzten Jahr
SELECT Jahr, Quartal, COUNT(*) as Geburten 
FROM births 
WHERE Jahr = 2022 
GROUP BY Jahr, Quartal 
ORDER BY Jahr, Quartal;
```

## Daten-Kompression und Token-Optimierung

MeLODy v1.2 implementiert eine spezielle JSON-Komprimierungstechnik, um den Token-Verbrauch bei der Kommunikation mit
ChatGPT zu reduzieren und die Qualität der Antworten zu verbessern. Diese Kompression erfolgt in zwei Hauptschritten:

1. **Property-Namen-Mapping:**
    - Alle Property-Namen in den JSON-Objekten werden durch numerische IDs ersetzt
    - Ein Mapping-Objekt (`idPerName`) wird erstellt, das die originalen Property-Namen den numerischen IDs zuordnet
    - Dies reduziert lange, wiederholte Schlüsselnamen auf kompakte Zahlen

2. **Daten-Transformation:**
    - Die Original-Objekte werden in neue Objekte umgewandelt, bei denen numerische IDs als Schlüssel verwendet werden
    - Die eigentlichen Datenwerte bleiben unverändert
    - Das Ergebnis ist ein komprimiertes Format mit minimalem Token-Verbrauch

Diese Technik reduziert den Token-Verbrauch erheblich, besonders bei großen Datensätzen mit vielen wiederkehrenden
Property-Namen. Da ChatGPT eine Token-Begrenzung hat, ermöglicht dies die Verarbeitung größerer Datenmengen innerhalb
eines einzelnen Austauschs und verbessert die Antwortqualität und -genauigkeit.

## Lessons Learned: Optimierung für ChatGPT

Durch unsere Erfahrungen haben wir wichtige Erkenntnisse zur Arbeit mit ChatGPT bei Datenabfragen gewonnen:

- **SQL vs. SPARQL:** ChatGPT beherrscht SQL-Abfragen hervorragend, während es mit SPARQL deutlich mehr Schwierigkeiten
  hat. Für statistische Datenabfragen ist SQL daher die bessere Wahl.
- **Mehrfachabfragen:** ChatGPT kann eigenständig mehrere aufeinanderfolgende Abfragen durchführen, um komplexe Fragen
  zu beantworten. Es beginnt typischerweise mit einer explorativen Abfrage und verfeinert diese basierend auf den ersten
  Ergebnissen.
- **API-Spezifikation:** Je kompakter und präziser die API-Spezifikation ist, desto genauer sind die von ChatGPT
  generierten Abfragen. Eine übermäßig komplexe API führt zu Ungenauigkeiten und Fehlinterpretationen.
- **Eindeutige Anweisungen:** Formulierungen wie „based on the dataset" und „avoid assumptions" sowie „NEVER ever create
  sample data" verhindern die Erstellung fiktiver Daten durch ChatGPT.
- **Trends und Grafiken:** Bei Fragen zu Trends antwortet ChatGPT oft mit Grafiken. Für textbasierte Antworten sollte
  dies explizit angegeben werden.
- **Weniger Parameter:** Weniger Parameter sind besser. Klare Leitplanken helfen ChatGPT, im Rahmen zu bleiben.
- **Mehr Routen:** Einfache, klar definierte Routen statt komplexer, mehrdeutiger Endpunkte optimieren die Nutzung.
- **Exakte Routen:** Vermeiden Sie dynamische Subrouten. Präzise Routen mit eng definierten Parametern reduzieren
  Interpretationsspielraum.
- **Swagger-Beschreibungen:** Die Beschreibungen in der Swagger-Datei sollten immer auf Englisch sein, da ChatGPT dies
  am besten verarbeiten kann.
- **Daten Kompaktheit:** ChatGPT kann maximal ~1000 JSON-Objekte effektiv analysieren. Präzise Daten in angemessenem
  Umfang verbessern die Antwortqualität.

## API-Struktur

MeLODy v1.2 verwendet einen dynamischen Ansatz mit SQLite und eine bewusst einfach gehaltene API mit folgenden
Endpunkten:

1. **`/schemas` **- Gibt eine Liste aller verfügbaren Datenstrukturen zurück
2. **`/query` **- Führt SQLite-Abfragen aus und gibt die Ergebnisse zurück

Diese minimalistische API-Struktur wurde gezielt gewählt, um ChatGPT zu optimalen Abfrageergebnissen zu verhelfen. Der
dynamische SQLite-Ansatz in Version 1.2 ermöglicht flexiblere Abfragen und eine bessere Datenverarbeitung im Vergleich
zu früheren Versionen.

## Wie die Datenverarbeitung funktioniert

Der MeLODy Bot verarbeitet Daten in mehreren Schritten:

1. **Anfrage Verarbeitung:**
    - Benutzeranfrage wird von ChatGPT in eine oder mehrere SQL-Abfragen übersetzt
    - ChatGPT kann bei Bedarf explorative Abfragen senden, um Schemadetails oder Datenbereiche zu verstehen
    - Die finalen Abfragen werden über den `/query`-Endpunkt an den Server gesendet

2. **Datenverarbeitung:**
    - Der Server führt die SQL-Abfrage auf der SQLite-Datenbank aus
    - Die Daten werden gefiltert und mittels des Komprimierungsalgorithmus in ein tokeneffizientes Format transformiert
    - Die komprimierten Daten werden zurück an ChatGPT gesendet

3. **Antwort-Generierung:**
    - ChatGPT dekodiert die komprimierten Daten intern
    - Die Daten werden analysiert und eine benutzerfreundliche Antwort mit Text und/oder Visualisierungen wird erstellt
    - Bei Bedarf werden weitere Abfragen gesendet, um die Antwort zu verfeinern oder zu erweitern

## Technologie-Stack

Das Projekt nutzt:

- **TypeScript** und **Node.js** mit **Express** für die API-Entwicklung
- **SQLite** als lokale Datenbank für statistische Daten
- **Swagger** für API-Dokumentation und -Beschreibung

## Erste Schritte

1. Repository klonen
2. Dependencies installieren: `npm install`
3. Server starten: `npm start`
4. Swagger-UI aufrufen unter: `/api/v2/swagger.yaml`

## Weiterentwicklung

MeLODy V1.2 ist vermutlich die letzte Iteration, welche ein ChatGPT Model verwendet. Version 2.0 wird auf ein
eigenes Agentic AI system setzen mit eigener Chat UI und interner LLM Anbindung. 
