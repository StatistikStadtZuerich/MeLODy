# MeLODy 1.2

While trying to create a much more dynamic approach to version 1.0 of our the ChatGPT powered SSZ knowledge Bot,
we made a few findings, which helps us in our upcoming implementation of the version 1.2, which still focuses on using a
custom ChatGPT Model.

We created and published version 1.1, which had a small but substantial change as we replaced the original Stadt-Zürich
source with SPARQL Queries, using the SSZ linked data repository. This is a step further in the dynamic direction, as we
do not rely on predefined data anymore, but can group and build the data views ourselves.

We discovered, that, since, November/December, ChatGPT models got even worse with adhering to enum specifications in API
Specs, as many groupBy enum values are completely overlooked, even when directly telling the AI, which fields it may
use. Therefore, we had to implement a few filter maps, to map certain values used by ChatGPT to order data.

For MeLODy 1.2, we had to do a little research, as version 1.2 moves from using predefined endpoints per dataset, to a
more dynamic version. The goal hereby will be, that ChatGPT requests checks for relevant stored datasets itself and then
creates a query, which is proxied directly to the datasource. Thus removing the Human-In-The-Loop and making more
autonomous.

We first tried to create dataset definitions, which can be used by the LLM, to determine, how to specify a SPARQL query.

Sadly we encountered two major flaws:

1. Each dataset needs a predefined schema, which may be hard to produce for every cube. The only way would be to use
   SHACL shapes, which could work.
2. The trickier problem with this approach is SPARQL. First of all, SPARQL is very open, and can be defined in many
   different ways. Second, SPARQL is very slow. Much slower than the ChatGPT request timeout (20s). A bit more complex
   SPARQL queries may take more than 5 minutes, and may not even produce the desired output, as the LLM may be
   erroneous.

A possible solution we thought of, is the usage of a small SQLite database. In this scenario, we would precache data.
As the data is received in CSV format, it would be easy to create a table and then store the data in them. LLMs have a
much better time creating SQL queries, rather than SPARQL. Also, SQL queries are much faster. Another advantage is, that
the schema per SQLite table can be queried, resulting in a more automatic and easier integration of new data.

ChatGPT is pretty good at making a few requests back to back, to receive some data, as long as it does not include
pagination, which confuses it.

### Tasks:

1. SQLite implementation ~4 hours
2. CSV to SQLite table ~4 hours
3. Creating Routes for dynamic querying of schemas and SQL endpoint ~4 hours
4. Testing with one small dataset
5. Trying to bring it to the level of MeLODy 1.1 ~1-3 days
6. Extending the system with new user stories ~3-4 days