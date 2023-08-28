import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { useEditorRef, useFocus } from "~/contexts/EditorContext";
import { FlowClick } from "./FlowClick";
import type { IData } from "./FlowClick";
import ReceiversIcon from "../assets/svg/receivers.svg";

const tagstyles = {
  backgroundColor: "#4F46E5",
  borderRadius: "100%",
  padding: "8px",
  marginTop: "4px",
};

const radius = {
  borderRadius: "15px",
};

const ReceiversNode = ({ data }: { data: IData }) => {
  const [hovered, setHovered] = useState(false);
  const editorRef = useEditorRef();
  const { isFocused } = useFocus();

  const customNodeStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    background: hovered ? "#4F46E5" : "#30353D",
    transition: "background-color 0.3s ease-in-out",
    borderRadius: "10px",
    fontSize: "10px",
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
  const splitedLabel = capitalizedLabel.split("/");
  const hasSlash = splitedLabel.length > 1;
  return (
    <div className="flex h-20 w-20 flex-col items-center rounded-sm">
      <div
        style={customNodeStyles}
        className={`cursor-pointer flex-col ${
          isFocused === data.id ? "animate-focus" : ""
        }`}
        onClick={handleClickNode}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex w-full flex-col items-center justify-center">
          <div className="flex items-center text-sm font-semibold text-white">
            {splitedLabel[0]}
          </div>
          <div style={tagstyles}>
            <ReceiversIcon color="#ffffff" />
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          style={{
            backgroundColor: "rgb(44 48 70 / 0%)",
            borderColor: "rgb(44 48 70 / 0%)",
          }}
        />
      </div>
      {hasSlash && (
        <div
          className="mb-[-57px] mt-1 rounded-full bg-[#020617] p-1 text-[#9CA2AB]"
          style={radius}
        >
          {splitedLabel[1]}
        </div>
      )}
    </div>
  );
};
export default ReceiversNode;
