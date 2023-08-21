import Logo from '../assets/svg/otelbin-logo-full.svg'
import Image from 'next/image'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@dash0/components/ui/dialog';
import { Button } from '@dash0hq/ui/src/components/ui/button';
import { WelcomeModalData } from './WelcomeModalData'

export default function WelcomeModal() {
    return (
        <Dialog>
            <DialogTrigger>
                <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className='p-4 flex flex-col justify-between'>
                <div className='flex flex-col pt-4 gap-y-6 px-4'>
                    <DialogHeader className='mx-auto'>
                        <DialogTitle><Logo /></DialogTitle>
                    </DialogHeader>
                    <Image src={WelcomeModalData[0]?.image || ''} alt='Welcome Modal Slide 1' />
                    <div className='flex flex-col gap-y-2'>
                        <DialogTitle className='text-center'>{WelcomeModalData[0]?.title}</DialogTitle>
                        <DialogDescription className='text-center'>
                            {WelcomeModalData[0]?.description}
                        </DialogDescription>
                    </div>
                    <DialogFooter>
                        <Button variant={'default'} size={'sm'}>Skip</Button>
                        <Button variant={'default'} size={'sm'} className='bg-[#6366F1] bg-pri'>Next</Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}