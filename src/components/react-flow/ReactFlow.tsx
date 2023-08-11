import React, { useMemo } from 'react';
import ReactFlow, { Panel, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import type { IConfig } from './dataType';
import JsYaml from 'js-yaml';
import useConfigReader from './useConfigReader';
import useEdgeCreator from './useEdgeCreator';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick } from './FlowClick';
import { ControlButton } from '@reactflow/controls';
import { MaximizeIcon, MinusIcon, PlusIcon } from 'lucide-react';
import ParentNodeType from './ParentNodeType';
import ReceiversNode from './ReceiversNode';
import ProcessorsNode from './ProcessorsNode';
import ExportersNode from './ExportersNode';
import { Parser } from 'yaml'
import { editor } from 'monaco-editor';

const controlButtonStyle = {
  backgroundColor: "#293548",
  color: "#94A3B8",
  borderBottom: "1px solid #293548",
  paddingTop: 8.5,
  paddingBottom: 8.5,
  paddingLeft: 13.5,
  paddingRight: 13.5,
}
export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const nodes = useConfigReader(jsonData, reactFlowInstance);
  const nodeTypes = useMemo(() => ({ processorsNode: ProcessorsNode, receiversNode: ReceiversNode, exportersNode: ExportersNode, parentNodeType: ParentNodeType }), []);
  const edges = useEdgeCreator(nodes, reactFlowInstance);
  const editorRef = useEditorRef();
  const { setViewport } = useReactFlow();


  const edgeOptions = {
    animated: false,
    style: {
      stroke: '#fff',
    },
  };

  function handleClickBackground(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    FlowClick(event, { label: 'pipelines', parentNode: '' }, editorRef, "pipelines");
  }

  const nodeInfo = reactFlowInstance.getNodes();

  editorRef?.current?.onDidChangeCursorPosition(handleCursorPositionChange);

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
        <Panel position="bottom-left" className='flex gap-2'>
          <div className='flex gap-0.5 '>
            <ControlButton onClick={() => reactFlowInstance.zoomIn()} title="Zoom-In" className='z-10 rounded-l-sm' style={controlButtonStyle}>
            <PlusIcon />
            </ControlButton>
            <ControlButton onClick={() => reactFlowInstance.zoomOut()} title="Zoom-In" className='z-10 rounded-r-sm' style={controlButtonStyle}>
            <MinusIcon />
            </ControlButton>
          </div>
            <ControlButton onClick={() => reactFlowInstance.fitView()} title="Zoom-In" className='rounded-sm' style={controlButtonStyle}>
            <MaximizeIcon size={84}/>
            </ControlButton>
        </Panel>
          
        </ReactFlow>

        
    );
  }