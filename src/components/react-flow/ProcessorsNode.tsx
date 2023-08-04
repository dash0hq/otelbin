import React from 'react';
import { Handle, Position } from 'reactflow';
import Tag from '../ui/NodTag';


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

const processorsNode = ({data}: {data:IData}) => {

  return (
    <div 
    style={customNodeStyles}
    >
      <Tag tag="Processor"/>
      <Handle type="target" position={Position.Left} style={{backgroundColor: "rgb(44 48 70 / 0%)", borderColor: "rgb(44 48 70 / 0%)"}} />
      <div className='w-full flex justify-center items-center flex-col'>
      <div className='text-white'>{data.label}</div>
        <div className='w-full text-[7px] text-[#8491A6] flex justify-center'>remove temporary attributes</div>
      </div>
      <Handle type="source" position={Position.Right} id='processor-a' style={{backgroundColor: "rgb(44 48 70 / 0%)", borderColor: "rgb(44 48 70 / 0%)"}}/>
    </div>
  );
}
export default processorsNode;