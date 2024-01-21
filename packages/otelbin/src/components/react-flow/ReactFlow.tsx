// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { type RefObject, useEffect, useMemo } from "react";
import ReactFlow, { Background, Panel, useReactFlow, useNodesState, useEdgesState, useStore } from "reactflow";
import "reactflow/dist/style.css";
import type { IConfig } from "./dataType";
import YAML, { Parser } from "yaml";
import useEdgeCreator from "./useEdgeCreator";
import { useFocus } from "~/contexts/EditorContext";
import { Minus, Plus, HelpCircle, Lock, Minimize2 } from "lucide-react";
import ParentsNode from "./node-types/ParentsNode";
import EmptyStateNode, { EmptyStateNodeData } from "./node-types/EmptyStateNode";
import { useClientNodes } from "./useClientNodes";
import type { editor } from "monaco-editor";
import { ButtonGroup } from "~/components/button-group";
import { Button } from "~/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import type { IItem, Document } from "../monaco-editor/parseYaml";
import ExportersNode from "./node-types/ExportersNode";
import ReceiversNode from "./node-types/ReceiversNode";
import ProcessorsNode from "./node-types/ProcessorsNode";
import { useLayout } from "./layout/useLayout";
import CyclicErrorEdge from "./CyclicErrorEdge";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;

export default function Flow({
	value,
	openDialog,
	locked,
	setLocked,
	editorRef,
}: {
	value: string;
	openDialog: (open: boolean) => void;
	locked: boolean;
	setLocked: (locked: boolean) => void;
	editorRef: EditorRefType | null;
}) {
	const reactFlowInstance = useReactFlow();

	const jsonData = useMemo(() => {
		try {
			return YAML.parse(value, { logLevel: "error", schema: "failsafe" }) as IConfig;
			// Catching and ignoring errors here since validation errors are already displayed in the validation console.
			// This prevents additional noise and instability when editing the config.
		} catch (error: unknown) {}
	}, [value]) as IConfig;

	const pipelines = useMemo(() => {
		const parsedYaml = Array.from(new Parser().parse(value));
		const doc = parsedYaml.find((token) => token.type === "document") as Document;
		const docItems = doc?.value?.items ?? [];
		const docService = docItems.find((item: IItem) => item.key?.source === "service");
		return docService?.value.items.find((item: IItem) => item.key?.source === "pipelines");
	}, [value]);
	const initNodes = useClientNodes(jsonData);
	const initEdges = useEdgeCreator(initNodes ?? []);
	const { nodes: layoutedNodes, edges: layoutedEdges } = useLayout(initNodes ?? [], initEdges);
	const [nodes, setNodes] = useNodesState(layoutedNodes !== undefined ? layoutedNodes : []);
	const [edges, setEdges] = useEdgesState(layoutedEdges);
	const widthSelector = (state: { width: number }) => state.width;
	const reactFlowWidth = useStore(widthSelector);

	useEffect(() => {
		reactFlowInstance.fitView();
	}, [reactFlowWidth, reactFlowInstance]);

	useEffect(() => {
		if (jsonData) {
			setEdges(layoutedEdges);
			setNodes(layoutedNodes !== undefined ? layoutedNodes : []);
			reactFlowInstance.fitView();
		} else {
			setNodes(EmptyStateNodeData);
			setEdges([]);
			reactFlowInstance.fitView();
		}
	}, [layoutedNodes, layoutedEdges, value, jsonData, setEdges, setNodes, reactFlowInstance]);

	const nodeTypes = useMemo(
		() => ({
			processorsNode: ProcessorsNode,
			receiversNode: ReceiversNode,
			exportersNode: ExportersNode,
			parentNodeType: ParentsNode,
		}),
		[]
	);
	const edgeTypes = useMemo(
		() => ({
			cyclicErrorEdge: CyclicErrorEdge,
		}),
		[]
	);
	const EmptyStateNodeType = useMemo(() => ({ emptyState: EmptyStateNode }), []);
	const { setCenter } = useReactFlow();
	const nodeInfo = reactFlowInstance.getNodes();
	const { setFocused } = useFocus();

	const edgeOptions = {
		animated: false,
		style: {
			stroke: "#fff",
		},
	};

	useEffect(() => {
		if (editorRef?.current && nodeInfo) {
			const cursorChangeEventListener = editorRef.current.onDidChangeCursorPosition(handleCursorPositionChange);
			return () => {
				cursorChangeEventListener.dispose();
			};
		}

		function handleCursorPositionChange(e: editor.ICursorPositionChangedEvent) {
			if (!locked && editorRef?.current) {
				const cursorOffset = editorRef?.current?.getModel()?.getOffsetAt(e.position) || 0;

				const wordAtCursor: editor.IWordAtPosition = editorRef?.current?.getModel()?.getWordAtPosition(e.position) || {
					word: "",
					startColumn: 0,
					endColumn: 0,
				};
				if (pipelines) {
					for (let i = 0; (pipelines?.value.items.length || 0) > i; i++) {
						if (
							cursorOffset >= (pipelines.value.items[i]?.key.offset || 0) &&
							cursorOffset <= (pipelines.value.items[i]?.sep[1]?.offset || 0)
						) {
							setFocusOnParentNode(wordAtCursor.word);
							setCenter(getParentNodePositionX(wordAtCursor.word), getParentNodePositionY(wordAtCursor.word), {
								zoom: 1.2,
								duration: 400,
							});
						}
						if (pipelines.value.items) {
							for (let j = 0; (pipelines.value.items[i]?.value.items.length || 0) > j; j++) {
								if (
									(pipelines.value.items[i]?.value.items[j]?.value.items.length || 0) === 1 &&
									cursorOffset >= (pipelines.value.items[i]?.value.items[j]?.value.items[0]?.value.offset || 0) &&
									cursorOffset <=
										(pipelines.value.items[i]?.value.items[j]?.value.items[0]?.value.offset || 0) +
											(pipelines.value.items[i]?.value.items[j]?.value.items[0]?.value.source?.length || 0)
								) {
									const level2 = pipelines.value.items[i]?.key?.source || "";
									const level3 = pipelines.value.items[i]?.value.items[j]?.key?.source || "";
									setFocusOnNode(wordAtCursor.word, level2, level3);
									setCenter(
										getNodePositionX(wordAtCursor.word, level2, level3) + 50,
										getNodePositionY(wordAtCursor.word, level2, level3) + 50,
										{ zoom: 2, duration: 400 }
									);
								} else if ((pipelines.value.items[i]?.value.items[j]?.value.items.length || 0) > 1) {
									for (let k = 0; (pipelines.value.items[i]?.value.items[j]?.value.items.length || 0) > k; k++) {
										if (
											cursorOffset >= (pipelines.value.items[i]?.value.items[j]?.value.items[k]?.value.offset || 0) &&
											cursorOffset <=
												(pipelines.value.items[i]?.value.items[j]?.value.items[k]?.value.offset || 0) +
													(pipelines.value.items[i]?.value.items[j]?.value.items[k]?.value.source?.length || 0)
										) {
											const level2 = pipelines.value.items[i]?.key?.source || "";
											const level3 = pipelines.value.items[i]?.value.items[j]?.key?.source || "";
											setFocusOnNode(wordAtCursor.word, level2, level3);
											setCenter(
												getNodePositionX(wordAtCursor.word, level2, level3) + 50,
												getNodePositionY(wordAtCursor.word, level2, level3) + 50,
												{ zoom: 2, duration: 400 }
											);
										}
									}
								}
							}
						}
					}

					if (cursorOffset > pipelines.key.offset && cursorOffset < (pipelines.sep[1]?.offset || 0)) {
						reactFlowInstance.fitView();
					}
				}
			}
		}

		function getNodePositionX(nodeId: string, level2: string, level3: string) {
			return (
				Number(
					nodeInfo?.find(
						(node) => node.data.label === nodeId && node.parentNode === level2 && node.type?.includes(level3)
					)?.position?.x
				) || 0
			);
		}

		function getNodePositionY(nodeId: string, level2: string, level3: string) {
			return (
				Number(
					nodeInfo?.find(
						(node) => node.data.label === nodeId && node.parentNode === level2 && node.type?.includes(level3)
					)?.positionAbsolute?.y
				) || 0
			);
		}

		function getParentNodePositionX(nodeId: string) {
			return (
				Number(nodeInfo?.find((node) => node.id === nodeId && node.type === "parentNodeType")?.position?.x) + 350 || 0
			);
		}

		function getParentNodePositionY(nodeId: string) {
			return (
				Number(nodeInfo?.find((node) => node.id === nodeId && node.type === "parentNodeType")?.position?.y) + 100 || 0
			);
		}

		function setFocusOnParentNode(nodeId: string) {
			const node = nodeInfo?.find((node) => node.id === nodeId && node.type === "parentNodeType");
			if (node) {
				setFocused(node.id);
			}
		}

		function setFocusOnNode(nodeId: string, level2: string, level3: string) {
			const node = nodeInfo?.find(
				(node) => node.data.label === nodeId && node.parentNode === level2 && node.type?.includes(level3)
			);
			if (node) {
				setFocused(node.id);
			}
		}
	}, [reactFlowInstance, setCenter, setFocused, pipelines, locked, editorRef, nodeInfo]);

	return (
		<ReactFlow
			nodes={jsonData.service ? nodes : EmptyStateNodeData}
			edges={edges}
			defaultEdgeOptions={edgeOptions}
			nodeTypes={jsonData.service ? nodeTypes : EmptyStateNodeType}
			edgeTypes={edgeTypes}
			fitView
			className="disable-attribution bg-default"
			proOptions={{
				hideAttribution: process.env.NEXT_PUBLIC_HIDE_REACT_FLOW_ATTRIBUTION === "true",
			}}
			maxZoom={!jsonData.service ? 1 : undefined}
		>
			<Background className="bg-default" />
			<Panel
				position="top-left"
				className="from-default-background !pointer-events-none !z-[4] !m-0 h-14 w-full bg-gradient-to-b"
			>
				<div />
			</Panel>
			<Panel position="bottom-left" className="flex gap-x-3">
				<ButtonGroup size={"xs"}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button onClick={() => reactFlowInstance.zoomOut()} size="xs">
								<Minus />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Zoom out</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button onClick={() => reactFlowInstance.zoomIn()} size="xs">
								<Plus />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Zoom in</TooltipContent>
					</Tooltip>
				</ButtonGroup>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button onClick={() => reactFlowInstance.fitView()} size="xs">
							<Minimize2 />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Fit view</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button className={locked ? "bg-primary" : undefined} onClick={() => setLocked(!locked)} size="xs">
							<Lock className={locked ? "!text-button-icon-active" : ""} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Toggle editor/visualization synchronization on cursor change</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button onClick={() => openDialog(true)} size="xs">
							<HelpCircle />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Show welcome dialog</TooltipContent>
				</Tooltip>
			</Panel>
		</ReactFlow>
	);
}
