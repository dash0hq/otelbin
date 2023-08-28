import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { useEditorRef, useFocus } from "~/contexts/EditorContext";
import { FlowClick } from "./FlowClick";
import type { IData } from "./FlowClick";
import ProcessorsIcon from "../assets/svg/processors.svg";

const tagstyles = {
  backgroundColor: "#F59E0B",
  borderRadius: "100%",
  padding: "8px",
  marginTop: "4px",
};
const radius = {
  borderRadius: "15px",
  fontSize: "10px",
    fontWeight: 400,
};

const ProcessorsNode = ({ data }: { data: IData }) => {
  const [hovered, setHovered] = useState(false);
  const editorRef = useEditorRef();
  const { isFocused } = useFocus();

  const customNodeStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    width: 80,
    height: 80,
    background: hovered ? "#F59E0B" : "#30353D",
    transition: "background-color 0.3s ease-in-out",
    borderRadius: "10px",
    fontSize: "8px",
    fontWeight: 400,
    paddingBottom: "6px",
    paddingTop: "6px",
  };

  function handleClickNode(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    FlowClick(event, data, editorRef);
  }

  const label = data.label || "";
  const capitalizedLabel = label.toUpperCase();
  const splitedLabel =
    typeof capitalizedLabel === "string" ? capitalizedLabel.split("/") : [];
  const hasSlash = splitedLabel?.length > 1;
  return (
    <>
      <div className="flex h-20 w-20 flex-col items-center">
        <div
          style={customNodeStyles}
          className={`cursor-pointer flex-col ${
            isFocused === data.id ? "animate-processorFocus" : ""
          }`}
          onClick={handleClickNode}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Handle
            type="target"
            position={Position.Left}
            style={{
              backgroundColor: "rgb(44 48 70 / 0%)",
              borderColor: "rgb(44 48 70 / 0%)",
            }}
          />
          <div className="flex flex-col items-center">
            <div className="flex items-center text-white">
              {splitedLabel[0]}
            </div>
            <div style={tagstyles}>
              <ProcessorsIcon color="#ffffff" />
            </div>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="processor-a"
            style={{
              backgroundColor: "rgb(44 48 70 / 0%)",
              borderColor: "rgb(44 48 70 / 0%)",
            }}
          />
        </div>
        {hasSlash && (
          <div
            className="mb-[-57px] mt-1 bg-[#020617] p-1 text-[#9CA2AB]"
            style={radius}
          >
            {splitedLabel[1]}
          </div>
        )}
      </div>
    </>
  );
};
export default ProcessorsNode;
