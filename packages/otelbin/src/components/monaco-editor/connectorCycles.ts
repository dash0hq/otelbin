// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

interface Pipeline {
	receivers?: unknown;
	exporters?: unknown;
}

interface CollectorConfig {
	connectors?: unknown;
	service?: {
		pipelines?: unknown;
	};
}

export interface ConnectorReference {
	connector: string;
	sourcePipeline: string;
	targetPipeline: string;
}

export interface ConnectorCycle {
	connectors: string[];
	pipelines: string[];
	references: ConnectorReference[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

interface TraversalFrame {
	node: string;
	successors: string[];
	nextSuccessor: number;
}

/**
 * Tarjan's algorithm, driven by an explicit stack rather than recursion. The depth of the
 * traversal is bounded by the number of pipelines, and a configuration can be pasted into the
 * editor wholesale, so recursing once per pipeline put a ceiling on the configurations that
 * could be validated at all: a chain of roughly five thousand pipelines overflowed the call
 * stack, and the resulting RangeError escaped the validator rather than surfacing as an error
 * in the console.
 */
function stronglyConnectedComponents(adjacency: Map<string, Set<string>>): string[][] {
	let nextIndex = 0;
	const indices = new Map<string, number>();
	const lowLinks = new Map<string, number>();
	const stack: string[] = [];
	const onStack = new Set<string>();
	const components: string[][] = [];

	const discover = (node: string): TraversalFrame => {
		indices.set(node, nextIndex);
		lowLinks.set(node, nextIndex);
		nextIndex++;
		stack.push(node);
		onStack.add(node);
		return { node, successors: [...(adjacency.get(node) ?? [])], nextSuccessor: 0 };
	};

	for (const root of adjacency.keys()) {
		if (indices.has(root)) {
			continue;
		}

		const traversal: TraversalFrame[] = [discover(root)];
		while (traversal.length > 0) {
			const frame = traversal[traversal.length - 1] as TraversalFrame;

			if (frame.nextSuccessor < frame.successors.length) {
				const successor = frame.successors[frame.nextSuccessor] as string;
				frame.nextSuccessor++;
				if (!indices.has(successor)) {
					traversal.push(discover(successor));
				} else if (onStack.has(successor)) {
					lowLinks.set(frame.node, Math.min(lowLinks.get(frame.node) as number, indices.get(successor) as number));
				}
				continue;
			}

			// Every successor of this node has been explored: fold its low link into its parent,
			// the step that happened on return from the recursive call.
			traversal.pop();
			const parent = traversal[traversal.length - 1];
			if (parent) {
				lowLinks.set(parent.node, Math.min(lowLinks.get(parent.node) as number, lowLinks.get(frame.node) as number));
			}

			if (lowLinks.get(frame.node) !== indices.get(frame.node)) {
				continue;
			}

			const component: string[] = [];
			let member: string;
			do {
				member = stack.pop() as string;
				onStack.delete(member);
				component.push(member);
			} while (member !== frame.node);
			components.push(component);
		}
	}

	return components;
}

/**
 * Finds pipeline cycles formed by connectors in an OpenTelemetry Collector
 * configuration. A connector creates a directed edge from every pipeline that
 * exports to it to every pipeline that receives from it.
 */
export function findConnectorCycles(config: unknown): ConnectorCycle[] {
	if (!isRecord(config)) {
		return [];
	}

	const collectorConfig = config as CollectorConfig;
	if (!isRecord(collectorConfig.connectors) || !isRecord(collectorConfig.service?.pipelines)) {
		return [];
	}

	const connectorNames = new Set(Object.keys(collectorConfig.connectors));
	const pipelines = collectorConfig.service.pipelines;
	const pipelineNames = Object.keys(pipelines);
	const exportersByConnector = new Map<string, Set<string>>();
	const receiversByConnector = new Map<string, Set<string>>();

	for (const pipelineName of pipelineNames) {
		const pipelineValue = pipelines[pipelineName];
		if (!isRecord(pipelineValue)) {
			continue;
		}
		const pipeline = pipelineValue as Pipeline;
		for (const connector of stringArray(pipeline.exporters)) {
			if (connectorNames.has(connector)) {
				const exporters = exportersByConnector.get(connector) ?? new Set<string>();
				exporters.add(pipelineName);
				exportersByConnector.set(connector, exporters);
			}
		}
		for (const connector of stringArray(pipeline.receivers)) {
			if (connectorNames.has(connector)) {
				const receivers = receiversByConnector.get(connector) ?? new Set<string>();
				receivers.add(pipelineName);
				receiversByConnector.set(connector, receivers);
			}
		}
	}

	const adjacency = new Map(pipelineNames.map((pipelineName) => [pipelineName, new Set<string>()]));
	const references: ConnectorReference[] = [];
	for (const connector of connectorNames) {
		for (const sourcePipeline of exportersByConnector.get(connector) ?? []) {
			for (const targetPipeline of receiversByConnector.get(connector) ?? []) {
				adjacency.get(sourcePipeline)?.add(targetPipeline);
				references.push({ connector, sourcePipeline, targetPipeline });
			}
		}
	}

	return stronglyConnectedComponents(adjacency)
		.filter((component) => component.length > 1 || adjacency.get(component[0] as string)?.has(component[0] as string))
		.map((component) => {
			const pipelineSet = new Set(component);
			const cycleReferences = references.filter(
				(reference) => pipelineSet.has(reference.sourcePipeline) && pipelineSet.has(reference.targetPipeline)
			);
			return {
				connectors: [...new Set(cycleReferences.map((reference) => reference.connector))].sort(),
				pipelines: [...component].sort(),
				references: cycleReferences,
			};
		})
		.sort((left, right) => left.pipelines.join("\0").localeCompare(right.pipelines.join("\0")));
}

function quotedList(values: string[]): string {
	return values.map((value) => `"${value}"`).join(", ");
}

export function connectorCycleMessage(cycle: ConnectorCycle): string {
	if (cycle.pipelines.length === 1) {
		const subject = cycle.connectors.length === 1 ? "Connector" : "Connectors";
		const verb = cycle.connectors.length === 1 ? "creates" : "create";
		return `${subject} ${quotedList(cycle.connectors)} ${verb} a cycle in pipeline "${cycle.pipelines[0]}".`;
	}
	return `Connector cycle detected between pipelines ${quotedList(cycle.pipelines)} via ${quotedList(
		cycle.connectors
	)}.`;
}
