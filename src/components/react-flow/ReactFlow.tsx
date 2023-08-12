import React, { useMemo, useRef } from 'react';
import ReactFlow, { Panel, useReactFlow } from 'reactflow';
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
import { IconButton } from '../ui/IconButton';
import useConfigReader from './useConfigReader';
import { Parser } from 'yaml'
import { editor } from 'monaco-editor';

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
export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const nodes = useConfigReader(jsonData, reactFlowInstance);
  const nodeTypes = useMemo(() => ({ processorsNode: ProcessorsNode, receiversNode: ReceiversNode, exportersNode: ExportersNode, parentNodeType: ParentNodeType }), []);
  const edges = useEdgeCreator(nodes, reactFlowInstance);
  const editorRef = useEditorRef();
  const { setViewport } = useReactFlow();
  const nodeInfo = reactFlowInstance.getNodes();
  const mouseUp = useRef<boolean>(false)

  const edgeOptions = {
    animated: false,
    style: {
      stroke: '#fff',
    },
  };

  function handleClickBackground(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    FlowClick(event, { label: 'pipelines', parentNode: '' }, editorRef, "pipelines");
  }

  editorRef?.current?.onDidChangeCursorPosition(handleMouseUp);

  function handleMouseUp(e: any) {
    editorRef?.current?.onMouseUp(() => {
      mouseUp.current = true
      if (mouseUp.current) {
        handleCursorPositionChange(e)
        mouseUp.current = false
      }
    })
  }

  function handleCursorPositionChange(e: any) {

    let doc: any;
    for (const token of new Parser().parse(editorRef?.current?.getValue() || '')) {
      doc = token.type === 'document' && token;
    }
    const cursorOffset = editorRef?.current?.getModel()?.getOffsetAt(e.position) || 0;
    const wordAtCursor: editor.IWordAtPosition = editorRef?.current?.getModel()?.getWordAtPosition(e.position) || { word: '', startColumn: 0, endColumn: 0, };
    const docItems = doc.value.items.length > 0 && doc.value.items || [];
    const docService = docItems?.filter((item: any) => item.key.source === 'service')[0];
    const docPipelines = docService && docService.value.items.length > 0 && docService.value.items.filter((item: any) => item.key.source === 'pipelines')[0];

    for (let i = 0; docPipelines.value.items.length > i; i++) {
      if (cursorOffset >= docPipelines.value.items[i].key.offset && cursorOffset <= docPipelines.value.items[i].sep[1].offset) {
        setViewport(getParentNodePosition(wordAtCursor.word), { duration: 400 });
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
          setViewport(getNodePosition(wordAtCursor.word, level2, level3), { duration: 400 });

        } else if (docPipelines.value.items[i].value.items[j].value.items.length > 1) {

          for (let k = 0; docPipelines.value.items[i].value.items[j].value.items.length > k; k++) {
            if (cursorOffset >= docPipelines.value.items[i].value.items[j].value.items[k].value.offset
              &&
              cursorOffset <= (docPipelines.value.items[i].value.items[j].value.items[k].value.offset + docPipelines.value.items[i].value.items[j].value.items[k].value.source.length)
            ) {
              const level2 = docPipelines.value.items[i].key.source;
              const level3 = docPipelines.value.items[i].value.items[j].key.source;
              setViewport(getNodePosition(wordAtCursor.word, level2, level3), { duration: 400 });
            }
          }
        }
      }
    }
    if (cursorOffset > docPipelines.key.offset && cursorOffset < docPipelines.sep[1].offset) {
      reactFlowInstance.fitView();
    }

  }

  function getNodePosition(nodeId: string, level2: string, level3: string,) {
    return {

      x: -Number(nodeInfo?.find((node) => node.data.label === nodeId && node.parentNode === level2 && node.type?.includes(level3))?.position?.x) || 0,
      y: -Number(nodeInfo?.find((node) => node.data.label === nodeId && node.parentNode === level2 && node.type?.includes(level3))?.positionAbsolute?.y) || 0,
      zoom: 1.5
    };
  }

  function getParentNodePosition(nodeId: string) {
    return {
      x: Number(nodeInfo?.find((node) => node.id === nodeId && node.type === 'parentNodeType')?.position?.x) || 0,
      y: -Number(nodeInfo?.find((node) => node.id === nodeId && node.type === 'parentNodeType')?.position?.y) || 0,
      zoom: 1
    };
  }

  return (

      <ReactFlow
        onClick={handleClickBackground}
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={edgeOptions}
        nodeTypes={nodeTypes}
        fitView
        style={{
          backgroundColor: '#000',
        }}
        className="disable-attribution" 
      >
        <Panel position="bottom-left" className='flex gap-0.5'>
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