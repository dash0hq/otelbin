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
  const receiversNode = ({data}: {data:IData}) => {

  return (
    <div 
    style={customNodeStyles}
    >
      <Tag tag="Receiver"/>
      <div className='w-full flex justify-center items-center flex-col'>
        <div className='text-white mt-[10px]'>{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} style={{backgroundColor: "rgb(44 48 70 / 0%)", borderColor: "rgb(44 48 70 / 0%)",
    }}/>
    </div>
  );
}
export default receiversNode;