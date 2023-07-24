import React, { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import Tag from '../ui/Tag';


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
  const ReceiverNode = ({data, id}: {data:IData, id: string}) => {


  // const onChange = useCallback((evt: any) => {
  //   // setNodeName(evt.target.value);
  //   console.log(evt.target.value)
  // }, []);
  

  return (
    <div 
    style={customNodeStyles}
    >
      <Tag tag="Receiver"/>
      <Handle type="source" position={Position.Right} id='u'/>
      <div className='w-full flex justify-center items-center flex-col'>
        {/* <input id="text" name="text" onChange={onChange}  className="nodrag w-16 rounded-sm h-6 pl-1 bg-[rgb(44 48 70 / 0%)] text-center"  style={handleSelectInput}/> */}
        <div className='text-white'>Icon</div>
        <div className='text-white'>{data.label}</div>
      </div>
    </div>
  );
}
export default ReceiverNode;