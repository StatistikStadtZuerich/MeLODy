# MeLODy 1.2

To create a more dynamic approach compared to version 1.0 of our ChatGPT-powered SSZ knowledge bot, we made several
findings that will guide the implementation of version 1.2, which continues to leverage a custom ChatGPT Model.

Version 1.1 brought a significant change by replacing the original Stadt-Zürich source with SPARQL Queries using the SSZ
linked data repository. This was a step forward in building a more dynamic system, as it eliminated reliance on
predefined data and allowed for flexible grouping and data view generation.

However, we discovered that, since November/December, ChatGPT models have struggled even more with adhering to enum
specifications in API Specs. Specifically, many `groupBy` enum values are often overlooked, even when explicitly
instructed on which fields to use. To overcome this, we implemented filter maps to standardize values used by ChatGPT
for ordering data.

In MeLODy 1.2, we conducted additional research as this version shifts from predefined endpoints per dataset to a more
dynamic and autonomous system. The goal is for ChatGPT requests to identify relevant stored datasets independently,
generate the required query, and proxy it directly to the data source — effectively removing the Human-In-The-Loop and
enhancing automation.

Initially, we explored creating dataset definitions to enable the LLM to form SPARQL queries. However, two significant
issues emerged:

1. Generating predefined schemas for each dataset is challenging and impractical for every cube. Although SHACL shapes
   might provide a solution, they add complexity.
2. SPARQL's inherent flexibility and openness create challenges. It often fails to deliver consistent results, and its
   performance is much slower than ChatGPT's 20-second request timeout. Complex SPARQL queries can take several minutes
   and may still produce incorrect outputs due to LLM errors.

A more feasible solution is using a small SQLite database for data caching. Data received in CSV format can be easily
stored in SQLite tables. This approach has several advantages:

- LLMs are better at crafting SQL queries compared to SPARQL.
- SQL queries are significantly faster than SPARQL.
- SQLite table schemas are queryable, enabling easier and more automated integration of new datasets.

ChatGPT performs well with sequential queries for data retrieval, as long as pagination, which tends to confuse the
model, is avoided.

### Tasks:

1. **SQLite Implementation** — ~4 hours  
   Set up a lightweight, efficient SQLite database to store and manage precached datasets.

2. **CSV to SQLite Table** — ~4 hours  
   Create functionality for converting incoming CSV data into SQLite tables with appropriate schemas.

3. **Dynamic Query Routes** — ~4 hours  
   Develop API routes to handle schema queries and provide SQL-based endpoints for data retrieval.

4. **Testing with Small Dataset** — Conduct rigorous tests using a small dataset to ensure reliable integration.

5. **Paralleling MeLODy 1.1** — ~1-3 days  
   Bring the system to functionality comparable to version 1.1 by refining performance and reliability.

6. **System Enhancement** — ~3-4 days  
   Incorporate additional user stories and expand functionality to ensure a robust, dynamic, and autonomous system.