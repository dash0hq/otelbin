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
import { PostHogProvider } from "~/app/PostHogProvider";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "OTelBin – powered by Dash0",
	description: "Edit, visualize and share OpenTelemetry Collector configurations",
};

export default function RootLayout({ children }: PropsWithChildren) {
	let content = (
		<html lang="en" className="dark overflow-hidden">
			<head>
				<meta name="viewport" content="initial-scale=1" />
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
	);

	const cookiesAccepted = cookies().get("otelbin-cookies-accepted")?.value === "true";
	if (cookiesAccepted) {
		content = <PostHogProvider>{content}</PostHogProvider>;
	}

	content = (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				variables: {
					colorPrimary: "#6366f1",
				},
			}}
		>
			{content}
		</ClerkProvider>
	);

	return content;
}
