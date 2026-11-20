# Observability with OpenTelemetry + Jaeger

An Express + MongoDB to-do service instrumented with OpenTelemetry. `tracing.js`
is loaded with `--require` so the auto-instrumentations patch `http`, `express`
and `mongodb` before use, and exports spans to Jaeger over OTLP on port 4318.

## Run

```bash
docker run -d -p 27017:27017 --name mongo mongo
docker run -d --name jaeger -p 16686:16686 -p 4317:4317 -p 4318:4318 -p 5778:5778 -p 9411:9411 jaegertracing/jaeger:2.5.0
npm install
node --require ./tracing.js index.js
curl http://localhost:3000/todo
```

Traces appear at <http://localhost:16686> under the service `todo-service`.

## Endpoints

`GET /todo` · `GET /todo/:id` · `POST /todo`
