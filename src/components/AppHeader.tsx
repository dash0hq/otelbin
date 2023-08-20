import Logo from './assets/svg/otelBin-logo-full.svg'
import { ButtonGroup } from "@dash0/components/ui/button-group";
import { IconButton } from '@dash0hq/ui/src/components/ui/icon-button';
import { Columns, Code2, Share2 } from 'lucide-react';
import { ServiceMapIcon } from "@dash0/icons";
import { useToast } from '@dash0hq/ui/src/components/ui/use-toast';


export default function AppHeader(
    { activeView,
        setView }
        : {
            activeView: string,
            setView: (view: string) => void
        }
) {

    const handleViewChange = (view: string) => {
        setView(view);
    };

    const { toast } = useToast();

    function handleShare() {
        navigator.clipboard.writeText(window.location.href);
        toast({
            description: "Current config copied to the clipboard.",
        })
    }

    return (
        <div className='h-[48px] bg-[#0F172A] flex justify-between items-center px-4 py-2  border-b-1'>
            <Logo />
            <div className='flex gap-x-2'>
            <ButtonGroup>
                <IconButton
                    className={`${activeView === 'both' && 'bg-[#6D737D]'} `}
                    onClick={() => handleViewChange('both')}
                    variant={'default'} size={'sm'} >
                        <Columns />
                </IconButton>
                <IconButton
                    className={`${activeView === 'code' && 'bg-[#6D737D]'} `}
                    onClick={() => handleViewChange('code')}
                    variant={'default'} size={'sm'} >
                        <Code2 />
                </IconButton>
                <IconButton
                    className={`${activeView === 'pipeline' && 'bg-[#6D737D]'} `}
                    onClick={() => handleViewChange('pipeline')}
                    variant={'default'} size={'sm'} >
                    <ServiceMapIcon />
                </IconButton>
            </ButtonGroup>
                <IconButton
                    className={`${activeView === 'code' && 'bg-[#6D737D]'} min-w-[93px] bg-[#6366F1]`}
                    onClick={handleShare}
                    variant={'default'} size={'sm'} >

                    <Share2 color='white' className='mr-2' />
                    Share
                </IconButton>
            </div>
        </div>

    )
}