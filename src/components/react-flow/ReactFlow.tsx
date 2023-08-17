import React, { useMemo, useRef } from "react";
import ReactFlow, { Panel, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import type { IConfig } from "./dataType";
import JsYaml from "js-yaml";
import useEdgeCreator from "./useEdgeCreator";
import { useEditorRef } from "~/contexts/EditorContext";
import { FlowClick } from "./FlowClick";
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import ParentNodeType from "./ParentNodeType";
import ReceiversNode from "./ReceiversNode";
import ProcessorsNode from "./ProcessorsNode";
import ExportersNode from "./ExportersNode";
import { IconButton } from "@dash0/components/ui/icon-button";
import useConfigReader from "./useConfigReader";
import { type editor } from "monaco-editor";
import * as d3 from "d3-hierarchy";
import { ParseYaml } from "./ParseYaml";

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

export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const nodes = useConfigReader(jsonData, reactFlowInstance);
  const nodeTypes = useMemo(
    () => ({
      processorsNode: ProcessorsNode,
      receiversNode: ReceiversNode,
      exportersNode: ExportersNode,
      parentNodeType: ParentNodeType,
    }),
    []
  );
  const edges = useEdgeCreator(nodes, reactFlowInstance);
  const editorRef = useEditorRef();
  const { setCenter } = useReactFlow();
  const nodeInfo = reactFlowInstance.getNodes();
  const mouseUp = useRef<boolean>(false);
  const docPipelines = ParseYaml("pipelines");

  const edgeOptions = {
    animated: false,
    style: {
      stroke: "#fff",
    },
  };

  function handleClickBackground(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    FlowClick(event, { label: "pipelines", parentNode: "" }, editorRef);
  }

  editorRef?.current?.onDidChangeCursorPosition(handleMouseUp);

  function handleMouseUp(e: editor.ICursorPositionChangedEvent) {
    editorRef?.current?.onMouseUp(() => {
      mouseUp.current = true;
      if (mouseUp.current) {
        handleCursorPositionChange(e);
        mouseUp.current = false;
      }
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
  return (
    <ReactFlow
      onClick={handleClickBackground}
      defaultNodes={nodes}
      nodes={nodes}
      defaultEdges={edges}
      edges={edges}
      defaultEdgeOptions={edgeOptions}
      nodeTypes={nodeTypes}
      fitView
      style={{
        backgroundColor: "#000",
      }}
      className="disable-attribution"
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
