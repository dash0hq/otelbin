import "@dash0/app/globals.css";
import "../components/react-flow/styles.css";

import { type AppType } from "next/dist/shared/lib/utils";
import { Toaster } from "@dash0/components/ui/toaster";
import { TooltipProvider } from "@dash0/components/ui/tooltip";

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<TooltipProvider>
			<Component {...pageProps} />
			<Toaster />
		</TooltipProvider>
	);
};

export default MyApp;
