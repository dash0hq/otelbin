import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick } from './FlowClick';
import type { IData } from './FlowClick';
import ProcessorsIcon from '../assets/svg/processors.svg';


const tagstyles = {
  backgroundColor: '#F59E0B',
  borderRadius: "100%",
  padding: '8px',
  marginTop: '4px',
}
const radius = {
  borderRadius: "15px",
}


const ProcessorsNode = ({ data }: { data: IData }) => {
  const [hovered, setHovered] = useState(false);
  const editorRef = useEditorRef();
  function handleClickNode(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    FlowClick(event, data, editorRef);
  }

  const customNodeStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    width: 80,
    height: 80,
    background: hovered ? "#F59E0B" : '#30353D',
    transition: 'background-color 0.3s ease-in-out',
    borderRadius: "10px",
    fontSize: "10px",
    paddingBottom: "6px",
    paddingTop: "6px",
  }
  const label = data.label || "";
  const capitalizedLabel = label.toUpperCase();
  const splitedLabel = typeof capitalizedLabel === 'string' ? capitalizedLabel.split("/") : [];
  const hasSlash = splitedLabel?.length > 1
  return (
    <>
    <div className='h-20 w-20 flex flex-col items-center'>

      <div 
      style={customNodeStyles}
        className='cursor-pointer flex-col'
        onClick={handleClickNode}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
      <Handle type="target" position={Position.Left} style={{ backgroundColor: "rgb(44 48 70 / 0%)", borderColor: "rgb(44 48 70 / 0%)" }} />
          <div className='flex flex-col items-center'>
            <div className='text-white text-sm font-semibold flex items-center'>{splitedLabel[0]}</div>
            <div style={tagstyles}>
            <ProcessorsIcon color="#ffffff" />
            </div>
          </div>
        <Handle type="source" position={Position.Right} id='processor-a' style={{backgroundColor: "rgb(44 48 70 / 0%)", borderColor: "rgb(44 48 70 / 0%)"}}/>
      </div>
      {hasSlash && (
        <div className='bg-[#020617] text-[#9CA2AB] p-1 mb-[-57px] mt-1' style={radius}>
          {splitedLabel[1]}
        </div>
      )}
    </div>
    </>
  );
}
export default ProcessorsNode;