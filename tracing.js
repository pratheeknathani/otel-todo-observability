'use strict';

// OpenTelemetry tracing setup for todo-service.
//
// Part 3 of the assignment: the ConsoleSpanExporter used in the previous
// revision is replaced with the OTLP exporter, which ships spans over
// OTLP/HTTP to Jaeger's collector on port 4318.
// https://opentelemetry.io/docs/languages/js/exporters/

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'todo-service',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({ url: OTLP_ENDPOINT }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // filesystem and DNS calls generate a span per operation and bury the
      // HTTP/Express/Mongo spans we actually care about
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
  ],
});

sdk.start();
console.log(`OpenTelemetry tracing started (OTLP -> ${OTLP_ENDPOINT})`);

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
