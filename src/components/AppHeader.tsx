import Logo from './assets/svg/otelBin-logo-full.svg'
import { ButtonGroup } from "@dash0/components/ui/button-group";
import { IconButton } from '@dash0hq/ui/src/components/ui/icon-button';
import { ServiceMapIcon, ApplicationIcon, EnvironmentIcon } from "@dash0/icons";
import { useState } from 'react';

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

    return (
        <div className='h-[48px] bg-[#0F172A] flex justify-between items-center px-4 py-2  border-b-1'>
            <Logo />
            <ButtonGroup>
                <IconButton
                    className={`${activeView === 'both' && 'bg-[#6D737D]'} `}
                    onClick={() => handleViewChange('both')}
                    variant={'default'} size={'sm'} >
                    <EnvironmentIcon />
                </IconButton>
                <IconButton
                    className={`${activeView === 'code' && 'bg-[#6D737D]'} `}
                    onClick={() => handleViewChange('code')}
                    variant={'default'} size={'sm'} >
                    <ApplicationIcon />
                </IconButton>
                <IconButton
                    className={`${activeView === 'pipeline' && 'bg-[#6D737D]'} `}
                    onClick={() => handleViewChange('pipeline')}
                    variant={'default'} size={'sm'} >
                    <ServiceMapIcon />
                </IconButton>
            </ButtonGroup>
        </div>

    )
}