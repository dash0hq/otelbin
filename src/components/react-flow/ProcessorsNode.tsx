import React from 'react';
import { Handle, Position } from 'reactflow';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick } from './FlowClick';
import ProcessorsIcon from '../assets/svg/processors.svg';


const customNodeStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  width: 80,
  height: 80,
  background: '#30353D',
  borderRadius: "10px",
  fontSize: "10px",
  paddingBottom: "6px",
  paddingTop: "6px",
}
const tagstyles = {
  backgroundColor: '#F59E0B',
  borderRadius: "100%",
  padding: '8px',
}
const radius = {
  borderRadius: "15px",
}

interface IData {
  label: string;
  parentNode: string;
}

const ProcessorsNode = ({ data }: { data: IData }) => {

  const editorRef = useEditorRef();

  function handleClickNode(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    FlowClick(event, data, editorRef, "processors");
  }

  const capitalizedLabel = data.label.charAt(0).toUpperCase() + data.label.slice(1)
  const splitedLabel = capitalizedLabel.split("/");
  const hasSlash = splitedLabel.length > 1
  return (
    <>
    <div className='h-20 w-20 flex flex-col items-center'>

      <div 
      style={customNodeStyles}
        className='cursor-pointer flex-col'
        onClick={handleClickNode}
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