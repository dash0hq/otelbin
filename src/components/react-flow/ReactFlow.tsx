import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Connection, ConnectionLineType, Edge, Node, Panel, Position, XYPosition, addEdge, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import type { IConfig } from './dataType';
import JsYaml from 'js-yaml';
import useEdgeCreator from './useEdgeCreator';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick } from './FlowClick';
import { MaximizeIcon, MinusIcon, PlusIcon } from 'lucide-react';
import ParentNodeType from './ParentNodeType';
import ReceiversNode from './ReceiversNode';
import ProcessorsNode from './ProcessorsNode';
import ExportersNode from './ExportersNode';
import useConfigReader from './useConfigReader';
import { editor } from 'monaco-editor';
import { ParseYaml } from './ParseYaml';
import { IconButton } from "@dash0/components/ui/icon-button";
import dagre from 'dagre';

const zoomInControlButtonStyle = {
  backgroundColor: "#293548",
  borderBottomRightRadius: "0px",
  borderTopRightRadius: "0px",
}
const zoomOutControlButtonStyle = {
  backgroundColor: "#293548",
  borderBottomLeftRadius: "0px",
  borderTopLeftRadius: "0px",
}
const fitViewControlButtonStyle = {
  backgroundColor: "#293548",
}


const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], parentWidth: number, parentHeight: number, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  const parentNodes = nodes.filter((node) => node.type === 'parentNodeType');
  // const childNodes = nodes.filter((node) => node.extent === 'parent');
  parentNodes.filter((node) => node.type === 'logs')
  
  parentNodes.forEach((node, index) => {
    dagreGraph.setNode(node.id, { width: parentWidth, height: parentHeight, rank: index});
    // console.log(dagreGraph.nodes().filter((node) => node === node))
  });

  nodes.forEach((node, index) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight});
  });

  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  dagre.layout(dagreGraph);

  // const handleFindParentPosition = (nodes : Node[]) => {
  //   const parentNodes = nodes.filter((node) => node.type === 'parentNodeType');
  //   parentNodes.forEach((pNode, index) => {
  //     const pNodeWithPosition = dagreGraph.node(pNode.id);
  //     pNode.position = {
  //       x: 602,
  //       y: 100,
  //     }
  //     // if (childPosition.x > pNodePosition.x && childPosition.x < pNodePosition.x + nodeWidth && childPosition.y > pNodePosition.y && childPosition.y < pNodePosition.y + nodeHeight) {
  //     //   console.log("parent position",pNodePosition.x, pNodePosition.y)
  //     //   return pNodePosition;
  //     // }
  //   });
  //   return nodes;
  // }
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (node.type === 'parentNodeType') {
      nodeWithPosition.height = parentHeight;
      nodeWithPosition.y = nodeWithPosition.y - parentHeight / 2;
    }
    console.log("node height",nodeWithPosition.height)
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    // handleFindParentPosition(nodes);
    console.log("child position",node.position.x, node.position.y)
    return node;
  });
  return { nodes, edges };
};



export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const initialNodes = useConfigReader(jsonData, reactFlowInstance, width, height );
  const nodeTypes = useMemo(() => ({ processorsNode: ProcessorsNode, receiversNode: ReceiversNode, exportersNode: ExportersNode, parentNodeType: ParentNodeType}), []);
  const initialEdges = useEdgeCreator(initialNodes, reactFlowInstance);
  const editorRef = useEditorRef();
  const { setCenter } = useReactFlow();
  const nodeInfo = reactFlowInstance.getNodes();
  const mouseUp = useRef<boolean>(false)
  const docPipelines = ParseYaml('pipelines');

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const parentNodes = nodes.filter((node) => node.type === 'parentNodeType');
  const childNodes = nodes.filter((node) => node.type !== 'parentNodeType');

  const handleData = () => {
    const newWidth = parentNodes.reduce((maxWidth, parentNode) => {
      const childrenForParent = childNodes.filter((n) => n.parentNode === parentNode.data.label);

      if (childrenForParent.length === 0) return maxWidth;

      const nodeAmount = childrenForParent.length;
      const width = nodeAmount * 100;
      return Math.max(maxWidth, width);
    }, 0);

    const newHeight = parentNodes.reduce((maxHeight, parentNode) => {
      const childrenForParent = childNodes.filter((n) => n.parentNode === parentNode.data.label);

      if (childrenForParent.length === 0) return maxHeight;

      const max = Math.max(
        childrenForParent.filter((c) => c.type === 'receiversNode').length,
        childrenForParent.filter((c) => c.type === 'exportersNode').length
      );
      const height = max * 100;
      return Math.max(maxHeight, height);
    }, 0);

    setWidth(newWidth);
    setHeight(newHeight);
  };

  useEffect(() => {
    handleData();
  }, [jsonData, initialNodes, childNodes]);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      width,
      height
      );
      
// console.log(width)
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [jsonData, initialNodes, initialEdges, reactFlowInstance, width, height]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
      ),
    []
  );
  const onLayout = useCallback(
    (direction: string | undefined) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        width,
        height,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, width, height]
  );

  
  const edgeOptions = {
    animated: false,
    style: {
      stroke: '#fff',
    },
  };

  function handleClickBackground(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    FlowClick(event, { label: 'pipelines', parentNode: '' }, editorRef);
  }

  editorRef?.current?.onDidChangeCursorPosition(handleMouseUp);

  function handleMouseUp(e: editor.ICursorPositionChangedEvent) {
    editorRef?.current?.onMouseUp(() => {
      mouseUp.current = true
      if (mouseUp.current) {
        handleCursorPositionChange(e)
        mouseUp.current = false
      }
    })
  }

  function handleCursorPositionChange(e: editor.ICursorPositionChangedEvent) {

    const cursorOffset = editorRef?.current?.getModel()?.getOffsetAt(e.position) || 0;
    const wordAtCursor: editor.IWordAtPosition = editorRef?.current?.getModel()?.getWordAtPosition(e.position) || { word: '', startColumn: 0, endColumn: 0, };


    for (let i = 0; docPipelines.value.items.length > i; i++) {
      if (cursorOffset >= docPipelines.value.items[i].key.offset && cursorOffset <= docPipelines.value.items[i].sep[1].offset) {
        setCenter(getParentNodePositionX(wordAtCursor.word), getParentNodePositionY(wordAtCursor.word), { zoom: 1.2, duration: 400 });
      }
      for (let j = 0; docPipelines.value.items[i].value.items.length > j; j++) {

        if (docPipelines.value.items[i].value.items[j].value.items.length === 1
          &&
          cursorOffset >= docPipelines.value.items[i].value.items[j].value.items[0].value.offset
          &&
          cursorOffset <= (docPipelines.value.items[i].value.items[j].value.items[0].value.offset + docPipelines.value.items[i].value.items[j].value.items[0].value.source.length)
        ) {

          const level2 = docPipelines.value.items[i].key.source;
          const level3 = docPipelines.value.items[i].value.items[j].key.source;
          setCenter(getNodePositionX(wordAtCursor.word, level2, level3) + 50, getNodePositionY(wordAtCursor.word, level2, level3) + 50, { zoom: 2, duration: 400 });

        } else if (docPipelines.value.items[i].value.items[j].value.items.length > 1) {

          for (let k = 0; docPipelines.value.items[i].value.items[j].value.items.length > k; k++) {
            if (cursorOffset >= docPipelines.value.items[i].value.items[j].value.items[k].value.offset
              &&
              cursorOffset <= (docPipelines.value.items[i].value.items[j].value.items[k].value.offset + docPipelines.value.items[i].value.items[j].value.items[k].value.source.length)
            ) {
              const level2 = docPipelines.value.items[i].key.source;
              const level3 = docPipelines.value.items[i].value.items[j].key.source;
              setCenter(getNodePositionX(wordAtCursor.word, level2, level3) + 50, getNodePositionY(wordAtCursor.word, level2, level3) + 50, { zoom: 2, duration: 400 });
            }
          }
        }
      }
    }
    if (cursorOffset > docPipelines.key.offset && cursorOffset < docPipelines.sep[1].offset) {
      reactFlowInstance.fitView();
    }
  }

  function getNodePositionX(nodeId: string, level2: string, level3: string,) {
    return Number(nodeInfo?.find((node) => node.data.label === nodeId && node.parentNode === level2 && node.type?.includes(level3))?.position?.x) || 0
  }

  function getNodePositionY(nodeId: string, level2: string, level3: string,) {
    return Number(nodeInfo?.find((node) => node.data.label === nodeId && node.parentNode === level2 && node.type?.includes(level3))?.positionAbsolute?.y) || 0
  }

  function getParentNodePositionX(nodeId: string) {
    return Number(nodeInfo?.find((node) => node.id === nodeId && node.type === 'parentNodeType')?.position?.x) + 350 || 0
  }

  function getParentNodePositionY(nodeId: string) {
    return Number(nodeInfo?.find((node) => node.id === nodeId && node.type === 'parentNodeType')?.position?.y) + 100 || 0
  }

  const buttonStyle = {
    backgroundColor: '#1E1E1E',
    borderRadius: '0.25rem',
    padding: 1
  }
  return (
      <ReactFlow
        onClick={handleClickBackground}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={edgeOptions}
        nodeTypes={nodeTypes}
        fitView
        style={{
          backgroundColor: '#000',
        }}
        className="disable-attribution" 
        >
        <Panel position="bottom-left" className='flex gap-0.5'>
        <button onClick={() => onLayout('TB')} style={buttonStyle}>vertical layout</button>
        <button onClick={() => onLayout('LR')} style={buttonStyle}>horizontal layout</button>

          <div className='flex'>
            <IconButton onClick={() => reactFlowInstance.zoomIn()} size="sm" variant="default" style={zoomInControlButtonStyle}>
              <PlusIcon color='#94A3B8'/>
            </IconButton>
            <IconButton onClick={() => reactFlowInstance.zoomOut()} size="sm" variant="default" style={zoomOutControlButtonStyle}>
              <MinusIcon color='#94A3B8'/>
            </IconButton>
          </div>
            <IconButton onClick={() => reactFlowInstance.fitView()} size="sm" variant="default" style={fitViewControlButtonStyle}>
              <MaximizeIcon color='#94A3B8'/>
            </IconButton>
        </Panel>
        </ReactFlow>

        
    );
  }