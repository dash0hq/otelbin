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

// interface ChildProps {
//   setNodeName: React.Dispatch<React.SetStateAction<string>>;
// }


// export default function TextUpdaterNode({setNodeName}: ChildProps) {
  const ProcessorNode = () => {


  const [isSelected, setIsSelected] = useState(false);
  const onChange = useCallback((evt: any) => {
    // setNodeName(evt.target.value);
    console.log(evt.target.value)
  }, []);
  
  const handleSelectInput = {
    backgroundColor: isSelected ? "#red" : "#2B3546",
    color: "#fff",
  }

  return (
    <div 
    style={customNodeStyles}
    >
      <Tag tag="Processor"/>
      <Handle type="target" position={Position.Left} id='c'/>
      <div className='w-full flex justify-center items-center flex-col'>
        <input id="text" name="text" onChange={onChange}  className="nodrag w-16 rounded-sm h-6 pl-1 bg-[rgb(44 48 70 / 0%)] text-center"  style={handleSelectInput}/>
        <div className='w-full text-[7px] text-[#8491A6] flex justify-center'>remove temporary attributes</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" />
      {/* <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} /> */}
    </div>
  );
}
export default ProcessorNode;