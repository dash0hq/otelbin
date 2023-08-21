import Logo from './assets/svg/otelbin-logo-full.svg'
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
        <div className='h-[48px] bg-otelbinDarkBlue flex justify-between items-center px-4 py-2 border-b-1'>
            <Logo />
            <div className='flex gap-x-2'>
            <ButtonGroup>
                <IconButton
                        className={`${activeView === 'both' && 'bg-otelbinGrey'} `}
                    onClick={() => handleViewChange('both')}
                    variant={'default'} size={'sm'} >
                        <Columns />
                </IconButton>
                <IconButton
                        className={`${activeView === 'code' && 'bg-otelbinGrey'} `}
                    onClick={() => handleViewChange('code')}
                    variant={'default'} size={'sm'} >
                        <Code2 />
                </IconButton>
                <IconButton
                        className={`${activeView === 'pipeline' && 'bg-otelbinGrey'} `}
                    onClick={() => handleViewChange('pipeline')}
                    variant={'default'} size={'sm'} >
                    <ServiceMapIcon />
                </IconButton>
            </ButtonGroup>
                <IconButton
                    className={`${activeView === 'code' && 'bg-otelbinGrey'} min-w-[93px] bg-otelbinPurple`}
                    onClick={handleShare}
                    variant={'default'} size={'sm'} >

                    <Share2 color='white' className='mr-2' />
                    Share
                </IconButton>
            </div>
        </div>

    )
}