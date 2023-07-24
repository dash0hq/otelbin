import React, { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import Tag from '../ui/Tag';


const handleStyle = { left: 10 };
const customNodeStyles = {
  width: 135,
  height: 65,
  padding: "4px 12px 10px 4px",
  background: '#2B3546',
  color: '#000',
  borderRadius: "10px",
  zIndex: 10,
  fontSize: "10px",
}

interface IData {
  label: string;
}

const ProcessorNode = ({data, id}: {data:IData, id: string}) => {

  return (
    <div 
    style={customNodeStyles}
    >
      <Tag tag="Processor"/>
      <Handle type="target" position={Position.Left} id='c'/>
      <div className='w-full flex justify-center items-center flex-col'>
      <div className='text-white'>{data.label}</div>
        <div className='w-full text-[7px] text-[#8491A6] flex justify-center'>remove temporary attributes</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" />
      {/* <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} /> */}
    </div>
  );
}
export default ProcessorNode;