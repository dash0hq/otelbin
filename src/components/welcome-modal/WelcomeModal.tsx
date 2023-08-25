import { useState } from 'react';
import Logo from '../assets/svg/otelbin-logo-full.svg'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@dash0/components/ui/dialog';
import { Button } from '@dash0hq/ui/src/components/ui/button';
import { WelcomeModalData } from './WelcomeModalData'

export default function WelcomeModal({
    open,
    setOpen }
    : {
        open: boolean;
        setOpen: (open: boolean) => void
    }) {
    const [step, setStep] = useState(0)

    function handleNext() {
        if (step <= 2) {
            setStep(step + 1)
        } else {
            closeAndStore()
        }
    }

    function handleSkip() {
        closeAndStore()
    }

    function closeAndStore() {
        setOpen(false);
        localStorage.setItem('welcomeModal', '0');
    }

    return (
        <Dialog open={open} onOpenChange={handleSkip}>
            <DialogContent className='p-4 flex flex-col justify-between bg-otelbinDarkPurple min-h-[550px]'>
                <div className='flex flex-col pt-4 gap-y-7 px-4 relative mb-4'>
                    <DialogHeader className='mx-auto'>
                        <DialogTitle>
                            <a href='https://www.dash0.com?utm_source=otelbin&utm_medium=welcome&utm_campaign=otelbin'
                                target='_blank'>
                                <Logo height='40' />
                            </a>
                        </DialogTitle>
                    </DialogHeader>
                    <Image src={WelcomeModalData[step]?.image || ''} alt='Welcome Modal Slide 1' />
                    <div className='flex flex-col gap-y-2'>
                        <DialogTitle className='text-center'>
                            {WelcomeModalData[step]?.title}
                        </DialogTitle>
                        <DialogDescription className='text-center'>
                            {WelcomeModalData[step]?.description}
                        </DialogDescription>
                    </div>
                </div>
                <div className='absolute bottom-6 left-8'>
                    <div className='flex items-center gap-x-1'>
                        {Array.from({ length: 4 }, (_, index) => (
                            <StepDiv key={index} activeStep={index === step} />
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    {step <= 2
                        ? (<Button

                            onClick={handleSkip}
                            variant={'default'} size={'sm'}>
                            Skip
                        </Button>)
                        : (<></>)}
                    <Button
                        autoFocus={true}
                        onClick={handleNext}
                        variant={'default'} size={'sm'} className='bg-otelbinPurple'>
                        {step <= 2 ? 'Next' : 'Done'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function StepDiv({ activeStep }: { activeStep: boolean; }) {
    return (
        <>
            {activeStep
                ? <div className='w-[30px] h-[10px] rounded-full bg-otelbinLightGrey' />
                : (<div className='w-[10px] h-[10px] rounded-full bg-otelbinLighterGrey2' />)
            }
        </>
    )
}