import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Connection, ConnectionLineType, Edge, Node, Panel, Position, addEdge, useEdges, useEdgesState, useNodes, useNodesInitialized, useNodesState, useReactFlow } from "reactflow";
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
import Dagre from "@dagrejs/dagre";
import { set } from "zod";
import { init } from "next/dist/compiled/@vercel/og/satori";
import { cookies } from "next/dist/client/components/headers";

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

const nodeWidth = 80;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const g = new Dagre.graphlib.Graph({compound: true}).setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, marginx: 50, marginy: 10, nodesep: 150, ranksep: 70,  });
  

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });
  nodes.forEach(node => {
      g.setNode(node.id,node);
      g.setParent(node.id, node.parentNode!);
  });
  if (g.nodes().length > 0) {
    Dagre.layout(g)
  }



  nodes.forEach((node: Node) => {
    // debugger
    const parent = g.parent(node.id)
    const children = nodes.filter(child => child.parentNode === parent);
    const minY = Math.min(...children.map(child => child.position.y));
      const maxY = Math.max(...children.map(child => child.position.y));
      const parentHeight = maxY - minY ;
      console.log(parentHeight)

    const { x, y } = g.node(node.id);
    
    
    if (node.parentNode === parent) {
      node.position = { x, y:   y - (parentHeight / 2)};
      node.parentNode = parent;
    }
    if(node.parentNode === undefined) {
      node.position = { x: 0, y: y - minY   };
      node.height = 300;
    }
    // node.height = 0;
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
  const jsonData = useMemo(
    () => JsYaml.load(isValidJson(value) ? value : "") as IConfig,
    [isValidJson(value) ? value : ""]
  );
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
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  useEffect(() => {
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedEdges, layoutedNodes]);
    

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params}, eds)
      ),
    [setEdges]
  );
  
  const edgeOptions = {
    animated: false,
    style: {
      stroke: "#fff",
    },
  };

  editorRef?.current?.onDidChangeCursorPosition(handleCursorPositionChange);

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
