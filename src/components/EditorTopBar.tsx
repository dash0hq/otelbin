
import { IconButton } from '@dash0hq/ui/src/components/ui/icon-button';
import { useToast } from '@dash0hq/ui/src/components/ui/use-toast';
import { ArrowDownToLine, Copy } from 'lucide-react';
import { useEditorRef } from '~/contexts/EditorContext';


export default function EditorTopBar() {

    const { toast } = useToast();
    const editorRef = useEditorRef();

    function handleDownload() {
        const downloadConfig = editorRef?.current?.getValue() || '';

        if (downloadConfig.length > 0) {
            const blob = new Blob([downloadConfig], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = "config.yaml";
            link.href = url;
            link.click();
        } else {
            toast({
                description: "There is no config to download",
            })
        }
    }

    function handleCopy() {
        const allText = editorRef?.current?.getValue() || '';
        if (allText.length > 0) {
            navigator.clipboard.writeText(allText);
            toast({
                description: "Config copied to the clipboard.",
            })
        } else {
            toast({
                description: "There is no config to copy",
            })
        }
    }

    return (
        <div className='flex justify-end items-center shadow-none z-10 absolute top-3 right-1'>
            <IconButton
                onClick={handleCopy}
                className='min-w-[97px] bg-[#1E1E1E] rounded-none'
                variant={'default'} size={'sm'} >
                <Copy className='mr-2' />
                Copy
            </IconButton>
            <IconButton
                onClick={handleDownload}
                className='min-w-[97px] bg-[#1E1E1E] rounded-none'
                variant={'default'} size={'sm'} >
                <ArrowDownToLine className='mr-2' />
                Download
            </IconButton>
        </div>

    )
}