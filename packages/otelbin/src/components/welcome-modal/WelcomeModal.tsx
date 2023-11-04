// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import Logo from "../assets/svg/otelbin_logo_white.svg";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "~/components/dialog";
import { Button } from "~/components/button";
import { welcomeModalData } from "./WelcomeModalData";

export default function WelcomeModal({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
	const [step, setStep] = useState(0);

	function handleNext() {
		if (step <= welcomeModalData.length - 2) {
			setStep(step + 1);
		} else {
			closeAndStore();
		}
	}

	function handleSkip() {
		closeAndStore();
	}

	function closeAndStore() {
		setOpen(false);
		setStep(0);
		localStorage.setItem("welcomeModal", "0");
	}

	return (
		<Dialog open={open} onOpenChange={handleSkip}>
			<DialogContent className="flex min-h-[550px] flex-col justify-between bg-neutral-150 p-4">
				<div className="relative mb-4 flex flex-col gap-y-7 px-4 pt-4">
					<DialogHeader className="mx-auto">
						<DialogTitle>
							<a
								href="https://www.dash0.com?utm_source=otelbin&utm_medium=welcome&utm_campaign=otelbin"
								target="_blank"
							>
								<div className="flex items-center gap-x-2">
									<Logo height="40" />
									<p className="text-2xl font-semibold">OTelBin</p>
								</div>
							</a>
						</DialogTitle>
					</DialogHeader>
					<Image
						src={welcomeModalData[step]?.image || ""}
						alt="Welcome Modal Slide Image"
						quality={100}
						className="border rounded-md border-neutral-300"
					/>
					<div className="flex flex-col gap-y-2">
						<DialogTitle className="text-center">{welcomeModalData[step]?.title}</DialogTitle>
						<DialogDescription className="text-center">{welcomeModalData[step]?.description}</DialogDescription>
					</div>
				</div>
				<div className="absolute bottom-6 left-8">
					<div className="flex items-center gap-x-1">
						{Array.from({ length: welcomeModalData.length }, (_, index) => (
							<StepDiv
								key={index}
								activeStep={index === step}
								isClickable={index < step}
								handleClick={() => setStep(index)}
								handleKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
									e.key === "Enter" && setStep(index);
									setStep(index);
								}}
							/>
						))}
					</div>
				</div>
				<DialogFooter>
					{step <= welcomeModalData.length - 2 ? (
						<Button onClick={handleSkip} variant={"default"} size={"sm"}>
							Skip
						</Button>
					) : (
						<></>
					)}
					<Button autoFocus={true} onClick={handleNext} variant={"default"} size={"sm"} className="bg-blue-500">
						{step <= welcomeModalData.length - 2 ? "Next" : "Done"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function StepDiv({
	activeStep,
	isClickable,
	handleClick,
	handleKeyDown,
}: {
	activeStep: boolean;
	isClickable: boolean;
	handleClick: () => void;
	handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
	return (
		<>
			<div
				className={`h-[10px] rounded-full ${
					activeStep
						? "w-[30px] bg-neutral-500"
						: `w-[10px] bg-neutral-350 ${isClickable ? "cursor-pointer hover:bg-neutral-400" : "cursor-default"}`
				} `}
				onClick={isClickable ? handleClick : undefined}
				onKeyDown={isClickable ? handleKeyDown : undefined}
			/>
		</>
	);
}
