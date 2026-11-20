'use strict';

// OpenTelemetry tracing setup for todo-service.
//
// Part 3, step 1: spans are printed to the console with the ConsoleSpanExporter
// so you can see the raw telemetry while the server handles requests.
// Part 3, step 2 replaces this exporter with the OTLP exporter that ships the
// same spans to Jaeger -- see the commit that follows this one.

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'todo-service',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log('OpenTelemetry tracing started (ConsoleSpanExporter)');

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
