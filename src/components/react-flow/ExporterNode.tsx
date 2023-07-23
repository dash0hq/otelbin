import React, { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import Tag from '../ui/Tag';


const handleStyle = { left: 10 };
const customNodeStyles = {
  width: 65,
  height: 75,
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
  export default function ExporterNode({data, id}: {data:IData, id: string}) {

  return (
    <div 
    style={customNodeStyles}
    >
      <Tag tag="Exporter"/>
      <Handle type="target" position={Position.Left} id='f'/>
      <div className='w-full flex justify-center items-center flex-col'>
        {/* <input id="text" name="text" onChange={onChange}  className="nodrag w-16 rounded-sm h-6 pl-1 bg-[rgb(44 48 70 / 0%)] text-center"  style={handleSelectInput}/> */}
        <div className='text-white'>Icon</div>
        <div className='text-white'>{data.label}</div>
      </div>
    </div>
  );
}