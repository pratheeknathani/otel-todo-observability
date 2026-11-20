# Observability with OpenTelemetry + Jaeger

An Express to-do service backed by MongoDB, instrumented with OpenTelemetry.
Traces are exported to a Jaeger all-in-one instance over OTLP.

## Prerequisites

- Node 18+
- A running Docker engine

## Running

Start MongoDB:

```bash
docker run -d -p 27017:27017 --name mongo mongo
```

Start Jaeger all-in-one:

```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 9411:9411 \
  jaegertracing/jaeger:2.5.0
```

Install dependencies and start the instrumented server:

```bash
npm install
node --require ./tracing.js index.js
```

Generate some traffic:

```bash
curl http://localhost:3000/todo
curl http://localhost:3000/todo/1
curl -X POST http://localhost:3000/todo -H 'Content-Type: application/json' -d '{"title":"new task"}'
```

Open the Jaeger UI at <http://localhost:16686> and select the `todo-service`
service to inspect the traces.

## Endpoints

| Method | Path        | Description              |
| ------ | ----------- | ------------------------ |
| GET    | `/todo`     | List all to-do items     |
| GET    | `/todo/:id` | Fetch one to-do item     |
| POST   | `/todo`     | Create a to-do item      |

## Tracing

`tracing.js` is loaded before the application with `--require` so that the
OpenTelemetry auto-instrumentations can patch `http`, `express` and `mongodb`
before those modules are used. The first version of this file used the
`ConsoleSpanExporter` to print spans to the terminal; it now uses the OTLP
exporter, which sends spans to Jaeger's OTLP/HTTP receiver on port 4318.
