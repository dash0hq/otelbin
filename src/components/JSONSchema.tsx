import type { JSONSchemaType } from "ajv"


interface IService {
    pipelines: object
}

interface IOtelConfig {
    receivers: object
    processors: object
    exporters: object
    extensions: object
    service: IService
    connectors: object
}

export const schema: JSONSchemaType<IOtelConfig> = {
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
            "properties": {
                "pipelines": {
                    "type": "object",
                    "additionalProperties": true,
                },
            },
            "required": ["pipelines"],
        },
        "connectors": {
            "type": "object",
            "additionalProperties": true,
        },
    },
    "required": ["service", "exporters"],
}
