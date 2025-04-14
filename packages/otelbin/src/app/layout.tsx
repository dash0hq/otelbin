// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import { type PropsWithChildren } from "react";
import { type Metadata } from "next";
import { TooltipProvider } from "~/components/tooltip";
import { Toaster } from "~/components/toaster";
import { dark } from "@clerk/themes";
import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "OTelBin – by Dash0",
	description: "Edit, visualize and share OpenTelemetry Collector configurations",
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<ClerkProvider
			afterSignOutUrl="/restore"
			appearance={{
				baseTheme: dark,
				variables: {
					colorPrimary: "#6366f1",
				},
			}}
		>
			<html lang="en" className="dark overflow-hidden">
				<head>
					<meta name="viewport" content="initial-scale=1" />
					<link rel="preload" href="/validation/supported-distributions" as="fetch" crossOrigin="anonymous" />
				</head>
				<body
					className={cn("max-h-screen min-h-screen min-w-[64rem] bg-background font-sans antialiased", inter.className)}
				>
					<TooltipProvider>
						<main className="max-h-screen min-h-screen">{children}</main>
						<Toaster />
					</TooltipProvider>
					<Analytics />
				</body>
			</html>
		</ClerkProvider>
	);
}
