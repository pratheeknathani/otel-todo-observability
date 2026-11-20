# Analysis of the telemetry data

The instrumented to-do service produced 11 traces during this run, all reported
under the service name `todo-service`. A **trace** is one end-to-end request, and
each one is a tree of **spans**. The shape is consistent across every request: an
HTTP server span (`GET /todo/:id`) is the root, Express contributes
`middleware - jsonParser` and `request handler`, and the MongoDB driver
contributes a client span such as `mongodb.find`. Jaeger's timeline draws these
nested by start offset and duration, so the causal order and the overlap between
them are visible rather than inferred.

Each span carries attributes. The root HTTP span records `http.method=GET`,
`http.route=/todo/:id`, `http.target=/todo/1`, `http.status_code=200`,
`net.peer.port`, and `http.user_agent=curl/8.7.1`. The database span records
`db.system=mongodb`, `db.name=todo_db`, `db.mongodb.collection=todos`,
`db.operation=find`, and a parameterized `db.statement` in which the values are
replaced by `?`. A shared trace ID is what links the spans together; that same
propagation is what would follow a request across process boundaries in a
genuinely distributed system.

The measurements are the payoff. Request latency ranged from 3.52 ms to
16.69 ms with a median of 4.54 ms, and the MongoDB span accounted for a median
56% of each request. The two slowest traces were the first `GET /todo`
(15.39 ms) and the first `POST /todo` (16.69 ms, 5 spans, containing both
`mongodb.aggregate` and `mongodb.insert`). Those are connection-pool and driver
warm-up costs, not steady-state behavior — without the per-span breakdown they
would read as random slowness, but the timeline attributes the time precisely.

On the three signals: this configuration exports **traces** only. The
`ConsoleSpanExporter` in the first version of `tracing.js` printed the same spans
to stdout, and switching to the OTLP exporter shipped them to Jaeger's collector
on port 4318. **Metrics** — aggregate counters and histograms — would require a
`MeterProvider` and an exporter to a time-series backend such as Prometheus;
Jaeger stores spans, not time series. **Logs** here are plain `console.log`
output with no link to any span. The OpenTelemetry logs SDK can correlate them by
injecting the trace and span IDs into each record, which is the step that turns
three separate streams into a single picture of one request.
