import type { StaticImageData } from 'next/image';
import WelcomeModal1 from '../../components/assets/png/welcome-modal-slide-1.png'
import WelcomeModal2 from '../../components/assets/png/welcome-modal-slide-2.png'
import WelcomeModal3 from '../../components/assets/png/welcome-modal-slide-3.png'
import WelcomeModal4 from '../../components/assets/png/welcome-modal-slide-4.png'

interface IWelcomeModal {
    title: string;
    description: string;
    image: StaticImageData;
}

export const WelcomeModalData: IWelcomeModal[] = [
    {
        title: 'Welcome to OTelBin!',
        description: 'A simple tool to visualize your OpenTelemetry configs',
        image: WelcomeModal1,
    },
    {
        title: 'Write your config in the Editor with live syntax validation.',
        description: 'Craft your configuration seamlessly in the Editor with real-time syntax validation at your side.',
        image: WelcomeModal2,
    },
    {
        title: 'Easily find your config errors.',
        description: 'Effortlessly pinpoint and rectify configuration errors with simplicity.',
        image: WelcomeModal3,
    },
    {
        title: 'Visualize your configs.',
        description: 'Transform your configurations into clear visualizations.',
        image: WelcomeModal4,
    },
]