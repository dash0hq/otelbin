import React from 'react';
import { Handle, Position } from 'reactflow';
import Tag from '../ui/NodTag';


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
  export default function ExporterNode({data}: {data:IData}) {

    const text = data.label.split("/");

  return (
    <div 
    style={customNodeStyles}
    >
      <Tag tag="Exporter"/>
      <Handle type="target" position={Position.Left} style={{backgroundColor: "rgb(44 48 70 / 0%)", borderColor: "rgb(44 48 70 / 0%)"}}/>
      <div className='w-full flex justify-center items-center flex-col'>
        <div className='text-white'>{text[0]}</div>
        {/* <div className='text-white'>{text[1]}</div> */}
      </div>
    </div>
  );
}