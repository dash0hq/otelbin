import "@dash0/app/globals.css";
import "../components/react-flow/styles.css";

import { ClerkProvider } from "@clerk/nextjs";
import { type PropsWithChildren } from "react";
import { type Metadata } from "next";
import { TooltipProvider } from "@dash0/components/ui/tooltip";
import { Toaster } from "@dash0/components/ui/toaster";
import { dark } from "@clerk/themes";
import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "OTelBin – powered by Dash0",
	description: "Edit, visualize and share OpenTelemetry Collector configurations",
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
			}}
		>
			<html lang="en" className="dark">
				<body className={cn("max-h-screen min-h-screen bg-background font-sans antialiased", inter.className)}>
					<TooltipProvider>
						<main className="max-h-screen min-h-screen">{children}</main>
						<Toaster />
					</TooltipProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
