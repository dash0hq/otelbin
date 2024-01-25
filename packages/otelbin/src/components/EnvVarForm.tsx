// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useRef, useState } from "react";
import { type IEnvVar, useEnvVarMenu, useEnvLines, type ILine } from "~/contexts/EditorContext";
import { IconButton } from "./icon-button";
import { Check, X, XCircle } from "lucide-react";
import { Label } from "./label";
import { Textarea } from "./textArea";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { envVarBinding } from "./validation/binding";
import { editorBinding } from "./monaco-editor/editorBinding";
import { extractEnvVarData, extractVariables } from "./monaco-editor/parseYaml";
import { useServerSideValidationEnabled } from "./monaco-editor/otelCollectorConfigValidation";

export default function EnvVarForm() {
	const { openEnvVarMenu, setOpenEnvVarMenu } = useEnvVarMenu();
	const { envVarLine } = useEnvLines();
	const [{ env, config }] = useUrlState([editorBinding, envVarBinding]);
	const variables = useMemo(() => extractVariables(config), [config]);
	const envVarData = extractEnvVarData(variables, env);
	const [envVarDataState, setEnvVarDataState] = useState(envVarData);
	function handleClose() {
		setOpenEnvVarMenu(false);
	}

	const unboundVariables = Object.values(envVarDataState).filter(
		(envVar) => envVar.submittedValue === undefined && envVar.defaultValue === ""
	);

	useEffect(() => {
		setEnvVarDataState(extractEnvVarData(variables, env));
	}, [variables, env]);

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
					{Object.values(envVarDataState).map((envVar) => (
						<EnvVar key={envVar.name} envVar={envVar} lines={envVarLine[envVar.name]} />
					))}
				</div>
			</div>
		</div>
	);
}

function EnvVar({ envVar, lines }: { envVar: IEnvVar; lines?: ILine }) {
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const [{ env }, getLink] = useUrlState([envVarBinding, editorBinding]);
	const [envVarValue, setEnvVarValue] = useState(env[envVar.name] ?? envVar.defaultValue ?? "");
	const isServerSideValidationEnabled = useServerSideValidationEnabled();

	function handleEnvVarChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
		setEnvVarValue(event.target.value);
	}

	function handleEnvVarSubmit() {
		if (typeof window !== "undefined") {
			window.history.pushState(null, "", getLink({ env: { ...env, [envVar.name]: envVarValue } }));
		}
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
		if (envVar.defaultValue === "") {
			setEnvVarValue(env[envVar.name] ?? "");
		}
	}, [env, envVar.defaultValue, envVar.name]);

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
			{lines && lines.lines.length > 0 && (
				<Label className="text-[12px] text-[#AFAFB2]" htmlFor="envVar">
					{`Used ${lines && lines.lines.length} ${lines && lines?.lines.length > 1 ? `times` : `time`} on line `}
					{lines?.lines?.map((lineNumber, index) => (
						<React.Fragment key={lineNumber}>
							<span className="text-blue-400">{lineNumber}</span>
							{index < (lines.lines?.length ?? 0) - 1 ? ` and ` : ``}
						</React.Fragment>
					))}
				</Label>
			)}
		</div>
	);
}
