import { type MutableRefObject } from "react";
import DeleteConfigButton from "./DeleteConfigButton";

export default function Buttons({
  editorRef,
  monacoRef,
}: {
  editorRef: MutableRefObject<any>;
  monacoRef: MutableRefObject<any>;
}) {
  // function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
  //     setData({ name: e.target.value, config: data.config })
  // }

  // const submitData = async (e: React.FormEvent) => {
  //     e.preventDefault()
  //     if (data.name === '' || data.config === '') {
  //         alert('Please fill all fields')
  //         return
  //     }
  //     try {
  //         const result = await mutation.mutateAsync(data);
  //         setData({ name: '', config: '' })
  //     } catch (err: unknown) {

  //     }
  //     setClicked(false)
  // }
  return (
    <></>
    // <div className='flex w-full gap-x-4'>
    //     <div className='flex flex-col gap-y-4 h-[100vh]'>
    //         <div className='flex flex-col gap-y-4 w-56'>
    //             <Button
    //                 onClick={handleCopy}>
    //                 Copy
    //             </Button>
    //             <Button
    //                 onClick={handleDownload}>
    //                 Download
    //             </Button>
    //             {!clicked && <Button
    //                 onClick={() => {
    //                     setData({ name: '', config: '' })
    //                     setClicked(true)
    //                 }}
    //             >
    //                 Create New
    //             </Button>}

    //             {clicked && <div className='flex gap-x-4'>
    //                 <Input
    //                     value={data.name}
    //                     onChange={handleChangeInput}
    //                     placeholder="config name"
    //                 />
    //                 <Button onClick={submitData}>
    //                     Submit
    //                 </Button>
    //             </div>}
    //         </div>
    //         <div className='flex flex-col max-h-[400px] overflow-y-auto'>
    //             {configs && configs?.length > 0 && configs.map((config) => {
    //                 return (
    //                     <div className='flex' key={config.id}>
    //                         <Button className='min-w-[250px]'
    //                             onClick={() => {
    //                                 setClicked(false)
    //                                 Router.push(`/config/${config.id}`)
    //                                 handleYamlValidation(config.config)
    //                             }}
    //                             variant={'outline'}>
    //                             {config.name}
    //                         </Button>
    //                         <DeleteConfigButton config={config} />
    //                     </div>
    //                 )
    //             })}
    //         </div>
    //     </div>
    // </div>
  );
}
