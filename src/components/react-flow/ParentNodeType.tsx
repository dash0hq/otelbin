import React, { memo } from 'react';
import PipelineTag from '../ui/PipelineTag';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';

interface IData {
  label: string;
}
const ParentNodeType = ({data}: {data:IData}) => {
  const nodes = useNodes();
  console.log(nodes)
  const rectaFlowInstance = useReactFlow();

  // const firstIndexOfPipeline = "#f59e0b1a";
  // const secondIndexOfPipeline = "rgb(153 218 254 / 10%)";
  // const thirdIndexOfPipeline = "rgb(45 177 86 / 11%)";
  // const fourthdIndexOfPipeline = "rgb(235 98 241 / 10%)";
  
  // const firstIndexOfPipelineBorder = "#F59E0B";
  // const secondIndexOfPipelineBorder = "#0AA8FF";
  // const thirdIndexOfPipelineBorder = "rgb(43 177 85)";
  // const fourthIndexOfPipelineBorder = "#911dc9";

  // const parentmatchNodes = rectaFlowInstance.getNodes().filter((node) => node.parentNode === data.label);
  // const parentLength = rectaFlowInstance.getNodes().filter((node) => node.parentNode === data.label).filter((node) => node.type === "receiversNode" || node.type ===  "exportersNode").length * 100;
  const parentNodes = rectaFlowInstance.getNodes().filter((node) => node.type === 'parentNodeType').map((node) => node.data.label);
  const findIndex = parentNodes.findIndex((node) => node === data.label);

  const handleBackgroundColor = (label: string) => {
    switch (label) {
      case "logs":
        return "#f59e0b1a";
      case "metrics":
        return "rgb(153 218 254 / 10%)";
      case "traces":
        return "rgb(45 177 86 / 11%)";
      case "traces/servicegraph":
        return "rgb(235 98 241 / 10%)";
        default:
          return "rgb(90 135 76 / 10%)";
    }
  }
  const handleBorderColor = (label: string) => {
    switch (label) {
      case "logs":
        return "1px solid #F59E0B";
      case "metrics":
        return "1px solid #0AA8FF";
      case "traces":
        return "1px solid rgb(43 177 85)";
      case "traces/servicegraph":
        return "1px solid #911dc9";
        default:
          return "1px solid rgb(90 135 76 / 10%)";
    }
  }

  const customNodeStyles = {
    padding: "4px 12px 10px 4px",
    background: handleBackgroundColor(data.label),
    border: handleBorderColor(data.label),
    color: '#000',
    borderRadius: "10px",
    fontSize: "10px",
    marginBottom: "10px",
  }

  return (
    <>
    <div style={customNodeStyles}>
      <PipelineTag findIndex={findIndex} tag={data.label}/>
    </div>
    </>
  );
}
export default memo(ParentNodeType);