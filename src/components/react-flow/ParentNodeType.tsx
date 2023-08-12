import React from 'react';
import PipelineTag from '../ui/PipelineTag';
import { useReactFlow } from 'reactflow';

interface IData {
  label: string;
}
const ParentNodeType = ({data}: {data:IData}) => {
  const rectaFlowInstance = useReactFlow();
  const metricBackground = "rgb(153 218 254 / 10%)";
  const logBackground = "rgb(90 135 76 / 10%)";
  const traceBackground = "rgb(245 158 11 / 10%)";

  const parentLength = rectaFlowInstance.getNodes().filter((node) => node.parentNode === data.label).filter((node) => node.type === "receiversNode" || node.type ===  "exportersNode").length * 100;

  const customNodeStyles = {
    width: 1570,
    height: parentLength,
    padding: "4px 12px 10px 4px",
    background: data.label === "metrics" ? metricBackground : data.label === "logs" ? logBackground : traceBackground,
    color: '#000',
    borderRadius: "10px",
    zIndex: 10,
    fontSize: "10px",
    marginBottom: "10px",
    border: '1px dashed #fff'
  }

    

  return (
    <div 
    style={customNodeStyles}
    >
      <PipelineTag tag={data.label}/>
    </div>
  );
}
export default ParentNodeType;