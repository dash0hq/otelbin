import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick, IData } from './FlowClick';
import ExportersIcon  from '../assets/svg/exporters.svg';


const customNodeStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  background: '#30353D',
  borderRadius: "10px",
  fontSize: "10px",
  paddingBottom: "6px",
  paddingTop: "6px",
}
const tagstyles = {
  backgroundColor: '#4F46E5',
  borderRadius: "100%",
  padding: '8px',
  marginTop: '4px',
}

const radius = {
  borderRadius: "15px",
}

export default function ExportersNode({ data }: { data: IData }) {
  const [hovered, setHovered] = useState(false);
  const editorRef = useEditorRef();

    const customNodeStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
      height: 80,
      background: hovered ? "#4F46E5" : '#30353D',
      transition: 'background-color 0.3s ease-in-out',
      borderRadius: "10px",
      fontSize: "10px",
      paddingBottom: "6px",
      paddingTop: "6px",
    }

    function handleClickNode(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      FlowClick(event, data, editorRef);
    }
    const label = data.label || "";
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    const splitedLabel = capitalizedLabel.split("/");
    const hasSlash = splitedLabel.length > 1
  return (
    <div className='h-20 w-20 flex flex-col items-center'>
      <div 
      style={customNodeStyles}
        className='cursor-pointer flex-col'
        onClick={handleClickNode}
        onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      >
        <Handle type="target" position={Position.Left} style={{backgroundColor: "rgb(44 48 70 / 0%)", borderColor: "rgb(44 48 70 / 0%)"}}/>
        <div className='flex flex-col items-center'>
        <div className='text-white text-sm font-semibold flex items-center'>{splitedLabel[0]}</div>
          <div style={tagstyles}>
            <ExportersIcon color="#ffffff" />
          </div>
        </div>
      </div>
      {hasSlash && (
        <div className='bg-[#020617] text-[#9CA2AB] p-1 mb-[-57px] rounded-full mt-1' style={radius}>
          {splitedLabel[1]}
        </div>
      )}
    </div>
  );
}