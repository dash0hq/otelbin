import React from 'react';
import PipelineTag from '../ui/PipelineTag';
import { useReactFlow } from 'reactflow';

interface IData {
  label: string;
}
const glowContainer = {
  width: "100%",
  height: "100%",
  inset: 0,
}
const ParentNodeType = ({data}: {data:IData}) => {
  const rectaFlowInstance = useReactFlow();
  const metricBackground = "rgb(153 218 254 / 10%)";
  const logBackground = "rgb(90 135 76 / 10%)";
  const traceBackground = "rgb(245 158 11 / 10%)";

  const logsLength = rectaFlowInstance.getNodes().filter((node) => node.parentNode === "logs").filter((node) => node.type === "receiversNode" || node.type ===  "exportersNode").length * 80;
  const metricsLength = rectaFlowInstance.getNodes().filter((node) => node.parentNode === "metrics").filter((node) => node.type === "receiversNode" || node.type ===  "exportersNode").length * 80;
  const tracesLength = rectaFlowInstance.getNodes().filter((node) => node.parentNode === "traces").filter((node) => node.type === "receiversNode" || node.type ===  "exportersNode").length * 80;

  const customNodeStyles = {
    width: 1570,
    height: data.label === "logs" ? logsLength : data.label === "metrics" ? metricsLength : data.label === "traces" ? tracesLength : "300px",
    padding: "4px 12px 10px 4px",
    background: data.label === "metrics" ? metricBackground : data.label === "logs" ? logBackground : traceBackground,
    color: '#000',
    borderRadius: "10px",
    zIndex: 10,
    fontSize: "10px",
    marginBottom: "10px",
  }
  const glowBlur = {
    display: "block",
    width: "100%",
    height: data.label === "logs" ? logsLength : data.label === "metrics" ? metricsLength : data.label === "traces" ? tracesLength : "300px",
    fill: "transparent",
    stroke: data.label === "metrics" ? "#99DAFE" : data.label === "logs" ? "#0AA8FF" : "#F59E0B",
    strokeWidth: "2px",
    strokeDasharray: "12 6",
    rx: "10px",
  }

    

  return (
    <div 
    style={customNodeStyles}
    className='relative'
    >
      <PipelineTag tag={data.label}/>
      <svg style={glowContainer} className='absolute'>
            <rect pathLength={3000} style={glowBlur}></rect>
          </svg>
    </div>
  );
}
export default ParentNodeType;