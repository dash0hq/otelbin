import React, { memo } from 'react';
import PipelineTag from '../ui/PipelineTag';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';

interface IData {
  label: string;
}
const ParentNodeType = ({data}: {data:IData}) => {
  const rectaFlowInstance = useReactFlow();
  const nodes = useNodes();
  const childNodes = nodes.filter((node) => node.parentNode === data.label);
  const childProcessorsNodes = childNodes.filter((node) => node.type === "processorsNode");
  const maxWidth = (childProcessorsNodes.length * 200) + 600;



  const children = nodes.filter(child => child.parentNode === data.label);
      const minY = Math.min(...children.map(child => child.position.y));
      const maxY = Math.max(...children.map(child => child.position.y));
      const parentHeight = maxY - minY + 180;

  const parentNodes = rectaFlowInstance.getNodes().filter((node) => node.type === 'parentNodeType').map((node) => node.data.label);
  const findIndex = parentNodes.findIndex((node) => node === data.label);

  console.log(parentHeight, maxWidth)
  const calculateBorderColor = (index: number): string => {
    switch (index) {
      case 0:
        return '1px solid #F59E0B';
      case 1:
        return '1px solid #0AA8FF';
      case 2:
        return '1px solid #40ad54';
      case 3:
        return '1px solid #911dc9';
    }
    return '#FFC542';
  };
  const calculateBackgroundColor = (index: number): string => {
    switch (index) {
      case 0:
        return '#f59e0b1a';
      case 1:
        return 'rgb(153 218 254 / 10%)';
      case 2:
        return 'rgb(45 177 86 / 11%)';
      case 3:
        return 'rgb(235 98 241 / 10%)';
    }
    return 'f59e0b1a';
  };
console.log(parentHeight)
  const customNodeStyles = {
    width: maxWidth,
    height: parentHeight ,
    padding: "4px 12px 10px 4px",
    background: calculateBackgroundColor(findIndex),
    border: calculateBorderColor(findIndex),
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