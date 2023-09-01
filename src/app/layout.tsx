import "@dash0/app/globals.css";
import "../components/react-flow/styles.css";

import { type PropsWithChildren } from "react";
import { type Metadata } from "next";
import { TooltipProvider } from "@dash0/components/ui/tooltip";
import { Toaster } from "@dash0/components/ui/toaster";

export const metadata: Metadata = {
	title: "OTelBin – powered by Dash0",
	description: "Edit, visualize and share OpenTelemetry Collector configurations",
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en" className="dark">
			<body className="min-h-screen bg-background font-sans antialiased">
				<TooltipProvider>
					<main className="min-h-screen">{children}</main>
					<Toaster />
				</TooltipProvider>
			</body>
		</html>
	);
}
