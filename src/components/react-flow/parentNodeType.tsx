import React from 'react';
import PipelineTag from '../ui/PipelineTag';

interface IData {
  label: string;
}
const glowContainer = {
  width: "100%",
  height: "100%",
  inset: 0,
}
const parentNodeType = ({data}: {data:IData}) => {
  
  const metricBackground = "rgb(153 218 254 / 10%)";
  const logBackground = "rgb(90 135 76 / 10%)";
  const traceBackground = "rgb(245 158 11 / 10%)";
  const customNodeStyles = {
    width: 1570,
    height: 239,
    padding: "4px 12px 10px 4px",
    background: data.label === "metrics" ? metricBackground : data.label === "logs" ? logBackground : traceBackground,
    color: '#000',
    borderRadius: "10px",
    zIndex: 10,
    fontSize: "10px",
  }
  const glowBlur = {
    display: "block",
    width: "100%",
    height: "100%",
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
export default parentNodeType;