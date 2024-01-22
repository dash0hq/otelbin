// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from "react";
import { type IEnvVar, useEnvVarMenu, useEnvVariables } from "~/contexts/EditorContext";
import { IconButton } from "./icon-button";
import { Check, X, XCircle } from "lucide-react";
import { Label } from "./label";
import { Textarea } from "./textArea";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding, envVarBinding } from "./validation/binding";

export default function EnvVarForm() {
	const { openEnvVarMenu, setOpenEnvVarMenu } = useEnvVarMenu();
	const { envVarState, setEnvVarState } = useEnvVariables();

	function handleClose() {
		setOpenEnvVarMenu(false);
	}

	const unboundVariables = Object.values(envVarState).filter(
		(envVar) => envVar.submittedValue === undefined && envVar.defaultValues?.length === 0
	);

	return (
		<div
			style={{
				width: openEnvVarMenu ? `${400}px` : 0,
				maxWidth: openEnvVarMenu ? `${400}px` : 0,
				transition: "all 0.2s ease-in-out",
			}}
			className="shrink-0 bg-default shadow-none border-b-default border-r overflow-hidden overflow-y-auto"
		>
			<div className="w-[400px] flex flex-col h-full">
				<div className="flex justify-between items-center px-4 pl-4 pr-1 py-[4.5px] shadow-none border-b-default border-b">
					<div className="text-sm text-default">
						<span
							style={{
								color: unboundVariables.length > 0 ? "#F87171" : "#69F18E",
							}}
						>
							{unboundVariables.length}
						</span>{" "}
						{`${unboundVariables.length === 1 ? "variable" : "variables"} unbound`}
					</div>
					<IconButton onClick={handleClose} variant={"transparent"} size={"xs"}>
						<X height={12} />
					</IconButton>
				</div>
				<div className="px-4">
					{Object.values(envVarState).map((envVar) => (
						<EnvVar key={envVar.name} envVar={envVar} envVarState={envVarState} setEnvVarState={setEnvVarState} />
					))}
				</div>
			</div>
		</div>
	);
}

function EnvVar({
	envVar,
	envVarState,
	setEnvVarState,
}: {
	envVar: IEnvVar;
	envVarState: Record<string, IEnvVar>;
	setEnvVarState: (envVariables: Record<string, IEnvVar>) => void;
}) {
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const [{ env }, getLink] = useUrlState([envVarBinding]);
	const [envVarValue, setEnvVarValue] = useState(envVar.submittedValue ?? "");
	const isServerSideValidationEnabled = useServerSideValidationEnabled();

	function handleEnvVarChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
		setEnvVarValue(event.target.value);
	}

	function handleEnvVarSubmit() {
		if (typeof window !== "undefined") {
			window.history.pushState(null, "", getLink({ env: { ...env, [envVar.name]: envVarValue } }));
		}
	}

	function useServerSideValidationEnabled(): boolean {
		const [{ distro, distroVersion }] = useUrlState([distroBinding, distroVersionBinding]);
		return !!distro && !!distroVersion;
	}

	useEffect(() => {
		//To enable automatic resizing of the textarea
		if (textAreaRef.current) {
			textAreaRef.current.style.height = "0px";
			const scrollHeight = textAreaRef.current.scrollHeight;
			textAreaRef.current.style.height = scrollHeight + "px";
		}
	}, [envVarValue]);

	useEffect(() => {
		if (isServerSideValidationEnabled) {
			handleEnvVarSubmit();
		}
		// eslint-disable-next-line
	}, [isServerSideValidationEnabled]);

	useEffect(() => {
		const distinctDefaultValues = new Set(envVar.defaultValues);
		const submittedValue = env[envVar.name];
		if (!submittedValue) {
			if (distinctDefaultValues.size > 1) {
				setEnvVarValue("");
				setEnvVarState({ ...envVarState, [envVar.name]: { ...envVar, submittedValue: undefined, defaultValues: [] } });
			} else if (distinctDefaultValues.size === 1) {
				setEnvVarValue(envVar?.defaultValues?.[0] ?? "");
				setEnvVarState({
					...envVarState,
					[envVar.name]: {
						...envVar,
						submittedValue: env[envVar.name] ?? envVar?.defaultValues?.[0],
						defaultValues: envVar?.defaultValues,
					},
				});
			}
		}
	}, [envVar.defaultValues, envVar, envVarState, setEnvVarState, env]);

	const envVarLinesIsArray = Array.isArray(envVar.lines) && envVar.lines?.length > 0;

	return (
		<div className="flex flex-col gap-y-1 my-6">
			<div className="flex flex-col w-full gap-1.5 h-full">
				<div className="flex gap-x-1 items-center">
					<Label htmlFor="envVar">{envVar.name}</Label>
					{envVarValue === env[envVar.name] && <Check height={14} color={"#69F18E"} />}
				</div>
				<div className="relative">
					<Textarea
						value={envVarValue}
						ref={textAreaRef}
						onChange={handleEnvVarChange}
						className="placeholder:italic h-[35px] min-h-[35px] max-h-[100px] overflow-hidden resize-none w-full pr-10"
						id="envVar"
						placeholder={env[envVar.name] === "" ? "empty" : "enter value"}
					/>
					{envVarValue === env[envVar.name] ? (
						<IconButton
							onClick={() => {
								setEnvVarValue("");
							}}
							variant={"transparent"}
							size={"xs"}
							className="absolute right-2 top-[6px] z-10"
						>
							<XCircle height={16} />
						</IconButton>
					) : (
						<IconButton
							onClick={handleEnvVarSubmit}
							variant={"transparent"}
							size={"xs"}
							className="absolute right-2 top-[6px] z-10"
						>
							<Check height={16} />
						</IconButton>
					)}
				</div>
			</div>
			<Label className="text-[12px] text-[#AFAFB2]" htmlFor="envVar">
				{`Used ${envVar.lines?.length} ${envVar.lines && envVar.lines?.length > 1 ? `times` : `time`} on line `}
				{envVarLinesIsArray &&
					envVar.lines?.map((lineNumber, index) => (
						<React.Fragment key={lineNumber}>
							<span className="text-blue-400">{lineNumber}</span>
							{index < (envVar?.lines?.length ?? 0) - 1 ? ` and ` : ``}
						</React.Fragment>
					))}
			</Label>
		</div>
	);
}
