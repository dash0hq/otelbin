import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Connection, ConnectionLineType, Edge, Node, Panel, Position, addEdge, useEdges, useEdgesState, useNodes, useNodesState, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import type { IConfig } from "./dataType";
import JsYaml from "js-yaml";
import useEdgeCreator from "./useEdgeCreator";
import { useEditorRef } from "~/contexts/EditorContext";
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import ParentNodeType from "./ParentNodeType";
import ReceiversNode from "./ReceiversNode";
import ProcessorsNode from "./ProcessorsNode";
import ExportersNode from "./ExportersNode";
import { IconButton } from "@dash0/components/ui/icon-button";
import useConfigReader from "./useConfigReader";
import type { editor } from "monaco-editor";
import { ParseYaml } from "./ParseYaml";
import dagre from 'dagre';
import { set } from "zod";

const zoomInControlButtonStyle = {
  backgroundColor: "#293548",
  borderBottomRightRadius: "0px",
  borderTopRightRadius: "0px",
};
const zoomOutControlButtonStyle = {
  backgroundColor: "#293548",
  borderBottomLeftRadius: "0px",
  borderTopLeftRadius: "0px",
};
const fitViewControlButtonStyle = {
  backgroundColor: "#293548",
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  const parentNodes = nodes.filter((node) => node.type === 'parentNodeType');
  const childNodes = nodes.filter((node) => node.type !== 'parentNodeType');
  
  childNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  parentNodes.forEach((pNode) => {
    const childrenForParent = nodes.filter((node) => node.parentNode === pNode.id);
    const receivers = childrenForParent.filter((node) => node.type === 'receiversNode');
    const exporters = childrenForParent.filter((node) => node.type === 'exportersNode');
    const maxChildHeight = Math.max(receivers.length, exporters.length) * 200;
    const parentWidth = childrenForParent.length * 30;
    const parentHeight = maxChildHeight + nodeHeight; // Add the height of the parent node
    
    dagreGraph.setNode(pNode.id, { width: parentWidth, height: parentHeight });
    
    // Calculate parent's position based on its children's positions
    const childrenPositions = childrenForParent.map(childNode => dagreGraph.node(childNode.id));
    const averageX = childrenPositions.reduce((sum, pos) => sum + pos.x, 0) / childrenPositions.length;
    const maxY = Math.max(...childrenPositions.map(pos => pos.y));
    const parentX = averageX - parentWidth / 2;
    const parentY = maxY + nodeHeight; // Ensure parent is below its children
    pNode.position = {
      x: parentX,
      y: parentY,
    };
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    // node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    if (node.type === 'parentNodeType') {
      const nodeParentWithPosition = dagreGraph.node(node.id);
      node.position = {
        x:  nodeParentWithPosition.x - nodeParentWithPosition.width / 2,
        y: nodeParentWithPosition.y - nodeParentWithPosition.height / 2,
      };
    } else {
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }
    return node;
  });


  return { nodes, edges };
};




function isValidJson(jsonData: string) {
  try {
    JsYaml.load(jsonData);
    return true;
  } catch (e) {
    return false;
  }
}

export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  // const jsonData = useMemo(
  //   () => JsYaml.load(isValidJson(value) ? value : "") as IConfig,
  //   [isValidJson(value) ? value : ""]
  // );
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const initialNodes = useConfigReader(jsonData, reactFlowInstance);
  const initialEdges = useEdgeCreator(initialNodes, reactFlowInstance);
  const nodeTypes = useMemo(
    () => ({
      processorsNode: ProcessorsNode,
      receiversNode: ReceiversNode,
      exportersNode: ExportersNode,
      parentNodeType: ParentNodeType,
    }),
    []
  );
  const editorRef = useEditorRef();
  const { setCenter } = useReactFlow();
  const nodeInfo = reactFlowInstance.getNodes();
  const mouseUp = useRef<boolean>(false);
  const docPipelines = ParseYaml("pipelines");

  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }, [setEdges, setNodes, jsonData, reactFlowInstance]);
    

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params}, eds)
      ),
    []
  );
  // const onLayout = useCallback(
  //   (direction: string | undefined) => {
  //     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  //       nodes,
  //       edges,
  //       direction
  //     );
  //     setNodes([...layoutedNodes]);
  //     setEdges([...layoutedEdges]);
  //   },
  //   [nodes, edges]
  // );

  
  const edgeOptions = {
    animated: false,
    style: {
      stroke: "#fff",
    },
  };

  editorRef?.current?.onDidChangeCursorPosition(handleMouseUp);

  function handleMouseUp(e: editor.ICursorPositionChangedEvent) {
    mouseUp.current = true;
    editorRef?.current?.onMouseUp(() => {
      handleCursorPositionChange(e);
    });
  }

  function handleCursorPositionChange(e: editor.ICursorPositionChangedEvent) {
    const cursorOffset =
      editorRef?.current?.getModel()?.getOffsetAt(e.position) || 0;
    const wordAtCursor: editor.IWordAtPosition = editorRef?.current
      ?.getModel()
      ?.getWordAtPosition(e.position) || {
      word: "",
      startColumn: 0,
      endColumn: 0,
    };

    for (let i = 0; docPipelines.value.items.length > i; i++) {
      if (
        cursorOffset >= docPipelines.value.items[i].key.offset &&
        cursorOffset <= docPipelines.value.items[i].sep[1].offset
      ) {
        setCenter(
          getParentNodePositionX(wordAtCursor.word),
          getParentNodePositionY(wordAtCursor.word),
          { zoom: 1.2, duration: 400 }
        );
      }
      for (let j = 0; docPipelines.value.items[i].value.items.length > j; j++) {
        if (
          docPipelines.value.items[i].value.items[j].value.items.length === 1 &&
          cursorOffset >=
            docPipelines.value.items[i].value.items[j].value.items[0].value
              .offset &&
          cursorOffset <=
            docPipelines.value.items[i].value.items[j].value.items[0].value
              .offset +
              docPipelines.value.items[i].value.items[j].value.items[0].value
                .source.length
        ) {
          const level2 = docPipelines.value.items[i].key.source;
          const level3 = docPipelines.value.items[i].value.items[j].key.source;
          setCenter(
            getNodePositionX(wordAtCursor.word, level2, level3) + 50,
            getNodePositionY(wordAtCursor.word, level2, level3) + 50,
            { zoom: 2, duration: 400 }
          );
        } else if (
          docPipelines.value.items[i].value.items[j].value.items.length > 1
        ) {
          for (
            let k = 0;
            docPipelines.value.items[i].value.items[j].value.items.length > k;
            k++
          ) {
            if (
              cursorOffset >=
                docPipelines.value.items[i].value.items[j].value.items[k].value
                  .offset &&
              cursorOffset <=
                docPipelines.value.items[i].value.items[j].value.items[k].value
                  .offset +
                  docPipelines.value.items[i].value.items[j].value.items[k]
                    .value.source.length
            ) {
              const level2 = docPipelines.value.items[i].key.source;
              const level3 =
                docPipelines.value.items[i].value.items[j].key.source;
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
    if (
      cursorOffset > docPipelines.key.offset &&
      cursorOffset < docPipelines.sep[1].offset
    ) {
      reactFlowInstance.fitView();
    }
    mouseUp.current = false;
  }

  function getNodePositionX(nodeId: string, level2: string, level3: string) {
    return (
      Number(
        nodeInfo?.find(
          (node) =>
            node.data.label === nodeId &&
            node.parentNode === level2 &&
            node.type?.includes(level3)
        )?.position?.x
      ) || 0
    );
  }

  function getNodePositionY(nodeId: string, level2: string, level3: string) {
    return (
      Number(
        nodeInfo?.find(
          (node) =>
            node.data.label === nodeId &&
            node.parentNode === level2 &&
            node.type?.includes(level3)
        )?.positionAbsolute?.y
      ) || 0
    );
  }

  function getParentNodePositionX(nodeId: string) {
    return (
      Number(
        nodeInfo?.find(
          (node) => node.id === nodeId && node.type === "parentNodeType"
        )?.position?.x
      ) + 350 || 0
    );
  }

  function getParentNodePositionY(nodeId: string) {
    return (
      Number(
        nodeInfo?.find(
          (node) => node.id === nodeId && node.type === "parentNodeType"
        )?.position?.y
      ) + 100 || 0
    );
  }

  const btn = {
    backgroundColor: '#010101',
    borderRadius: '5px'
  }
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      defaultEdgeOptions={edgeOptions}
      nodeTypes={nodeTypes}
      onConnect={onConnect}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      fitView
      style={{
        backgroundColor: "#000",
      }}
      className="disable-attribution"
      proOptions={{
        hideAttribution: true,
      }}
    >
      <Panel position="bottom-left" className="flex gap-0.5">
      {/* <button onClick={() => onLayout('TB')} style={btn}>vertical layout</button>
        <button onClick={() => onLayout('LR')} style={btn}>horizontal layout</button> */}
        <div className="flex">
          <IconButton
            onClick={() => reactFlowInstance.zoomIn()}
            size="sm"
            variant="default"
            style={zoomInControlButtonStyle}
          >
            <PlusIcon color="#94A3B8" />
          </IconButton>
          <IconButton
            onClick={() => reactFlowInstance.zoomOut()}
            size="sm"
            variant="default"
            style={zoomOutControlButtonStyle}
          >
            <MinusIcon color="#94A3B8" />
          </IconButton>
        </div>
        <IconButton
          onClick={() => reactFlowInstance.fitView()}
          size="sm"
          variant="default"
          style={fitViewControlButtonStyle}
        >
          <MaximizeIcon color="#94A3B8" />
        </IconButton>
      </Panel>
    </ReactFlow>
  );
}
