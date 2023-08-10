import React from 'react';
import { Handle, Position } from 'reactflow';
import Tag from '../ui/NodTag';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick } from './FlowClick';


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
  parentNode: string;
}
const ReceiversNode = ({ data }: { data: IData }) => {

    const editorRef = useEditorRef();

    function handleClickNode(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      FlowClick(event, data, editorRef, 'receivers');
      console.log(data.label, '', data.parentNode);
    }

  return (
    <div 
    style={customNodeStyles}
      className='cursor-pointer'
      onClick={handleClickNode}
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
export default ReceiversNode;