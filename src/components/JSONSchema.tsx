import type { JSONSchemaType } from "ajv"

interface MyData {
    receivers: object
    processors: object
    exporters: object
    extensions: object
    service: object
    connectors: object
}

export const schema: JSONSchemaType<MyData> = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://dash0.com/otelcollector.json",
    "title": "OpenTelemetry Collector Configuration",
    "description": "OpenTelemetry Collector Configuration",
    "type": "object",
    "properties": {
        "receivers": {
            "type": "object",
            "additionalProperties": true
        },
        "processors": {
            "type": "object",
            "additionalProperties": true
        },
        "exporters": {
            "type": "object",
            "additionalProperties": true
        },
        "extensions": {
            "type": "object",
            "additionalProperties": true
        },
        "service": {
            "type": "object",
            "additionalProperties": true,
        },
        "connectors": {
            "type": "object",
            "additionalProperties": true,
        },
    },
    "required": ["receivers", "exporters"],
}
