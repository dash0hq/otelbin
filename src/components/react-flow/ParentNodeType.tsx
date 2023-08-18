import React, { memo } from 'react';
import PipelineTag from '../ui/PipelineTag';
import { NodeResizer, useReactFlow } from 'reactflow';

interface IData {
  label: string;
}
const ParentNodeType = ({data}: {data:IData}) => {
  const rectaFlowInstance = useReactFlow();

  const firstIndexOfPipeline = "#f59e0b1a";
  const secondIndexOfPipeline = "rgb(153 218 254 / 10%)";
  const thirdIndexOfPipeline = "rgb(45 177 86 / 11%)";
  const fourthdIndexOfPipeline = "rgb(235 98 241 / 10%)";
  
  const firstIndexOfPipelineBorder = "#F59E0B";
  const secondIndexOfPipelineBorder = "#0AA8FF";
  const thirdIndexOfPipelineBorder = "rgb(43 177 85)";
  const fourthIndexOfPipelineBorder = "#911dc9";

  const parentmatchNodes = rectaFlowInstance.getNodes().filter((node) => node.parentNode === data.label);
  const parentLength = rectaFlowInstance.getNodes().filter((node) => node.parentNode === data.label).filter((node) => node.type === "receiversNode" || node.type ===  "exportersNode").length * 100;
  const parentNodes = rectaFlowInstance.getNodes().filter((node) => node.type === 'parentNodeType').map((node) => node.data.label);
  const findIndex = parentNodes.findIndex((node) => node === data.label);

  const customNodeStyles = {
    width: 1570,
    height: parentLength,
    padding: "4px 12px 10px 4px",
    background: findIndex === 0 ? firstIndexOfPipeline : findIndex === 1 ? secondIndexOfPipeline : findIndex === 2 ? thirdIndexOfPipeline : findIndex === 3 ? fourthdIndexOfPipeline : "rgb(90 135 76 / 10%)",
    border: findIndex === 0 ? `1px solid ${firstIndexOfPipelineBorder}` : findIndex === 1 ? `1px solid ${secondIndexOfPipelineBorder}` : findIndex === 2 ? `1px solid ${thirdIndexOfPipelineBorder}` : findIndex === 3 ? `1px solid ${fourthIndexOfPipelineBorder}` : "1px dashed rgb(90 135 76 / 10%)",
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