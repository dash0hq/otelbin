// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IError } from "./ValidationErrorConsole";
import ValidationErrorConsole from "./ValidationErrorConsole";
import EditorTopBar from "../EditorTopBar";
import { useEditorRef, useEditorDidMount, useMonacoRef, useViewMode } from "~/contexts/EditorContext";
import MonacoEditor, { loader, type OnChange } from "@monaco-editor/react";
import { ReactFlowProvider } from "reactflow";
import Flow from "../react-flow/ReactFlow";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import AppHeader from "../AppHeader";
import WelcomeModal from "../welcome-modal/WelcomeModal";
import { validateOtelCollectorConfigurationAndSetMarkers } from "~/components/monaco-editor/otelCollectorConfigValidation";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { AppFooter } from "~/components/AppFooter";
import { AutoSizer } from "~/components/AutoSizer";
import { ResizeBar } from "~/components/monaco-editor/ResizeBar";
import { Fira_Code } from "next/font/google";
import { useClerk } from "@clerk/nextjs";
import { PanelLeftOpen } from "lucide-react";
import { IconButton } from "~/components/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { track } from "@vercel/analytics";
import { useServerSideValidation } from "../validation/useServerSideValidation";

const firaCode = Fira_Code({
	display: "swap",
	adjustFontFallback: false,
	subsets: ["latin"],
});

export default function Editor({ locked, setLocked }: { locked: boolean; setLocked: (locked: boolean) => void }) {
	const editorDidMount = useEditorDidMount();
	const editorRef = useEditorRef();
	const monacoRef = useMonacoRef();
	const [width, setWidth] = useState(Number(localStorage.getItem("width") ?? 440));
	const { setViewMode, viewMode } = useViewMode();
	const savedOpenModal = Boolean(typeof window !== "undefined" && localStorage.getItem("welcomeModal"));
	const [openDialog, setOpenDialog] = useState(savedOpenModal ? !savedOpenModal : true);
	const [{ config }, getLink] = useUrlState([editorBinding]);
	const [currentConfig, setCurrentConfig] = useState<string>(config);
	const clerk = useClerk();
	const serverSideValidationResult = useServerSideValidation();

	const onWidthChange = useCallback((newWidth: number) => {
		localStorage.setItem("width", String(newWidth));
		setWidth(newWidth);
	}, []);

	const onChangeConfig = useCallback(
		(newConfig: string) => {
			if (typeof window !== "undefined") {
				window.history.pushState(null, "", getLink({ config: newConfig }));
			}
		},
		[getLink]
	);

	const totalValidationErrors = useMemo((): IError => {
		if (editorRef && monacoRef) {
			return validateOtelCollectorConfigurationAndSetMarkers(
				currentConfig,
				editorRef,
				monacoRef,
				serverSideValidationResult
			);
		} else {
			return {};
		}
	}, [currentConfig, editorRef, monacoRef, serverSideValidationResult]);

	const isValidConfig =
		totalValidationErrors.jsYamlError == null && (totalValidationErrors.ajvErrors?.length ?? 0) === 0;

	const handleEditorChange: OnChange = (value) => {
		setCurrentConfig(value || "");
	};

	useEffect(() => {
		if (config !== editorBinding.fallback) {
			track("Opened with non-default config");
		}
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		// This is done to support config restoration when signing in. See the
		// /restore page. Without this we ran into return URL problems with GitHub
		// and Google as our return URL can be **very** long.
		localStorage.setItem("config-restore", config);
	}, [config]);

	useEffect(() => {
		// This useEffect is used to detect changes in the "currentConfig" state
		// and trigger the "onChangeConfig" function when it differs from the "config"
		// to prevent the conflict with monaco editor's "onChange" event that makes sudden
		// movements of the cursor
		if (currentConfig !== config) {
			onChangeConfig(currentConfig);
		}
	}, [onChangeConfig, currentConfig, config]);

	useEffect(() => {
		if (clerk.loaded) {
			loader.init().then((monaco) => {
				monaco.editor.defineTheme("OTelBin", {
					base: "vs-dark",
					inherit: true,
					rules: [
						{ token: "comment", foreground: "#6D737D" },
						{ token: "string.yaml", foreground: "#38BDF8" },
						{ token: "number.yaml", foreground: "#38BDF8" },
						{ token: "keyword.operator.assignment", foreground: "#38BDF8" },
					],
					colors: {
						"editor.background": "#151721",
						"editorLineNumber.foreground": "#6D737D",
						"editorLineNumber.activeForeground": "#F9FAFB",
						"editorCursor.foreground": "#F9FAFB",
						"editor.selectionBackground": "#30353D",
						"editor.selectionHighlightBackground": "#30353D",
						"editor.hoverHighlightBackground": "#30353D",
						"editor.lineHighlightBackground": "#30353D",
						"editor.lineHighlightBorder": "#30353D",
					},
				});
				monaco.editor.setTheme("OTelBin");
			});
		}
	}, [clerk.loaded]);

	function calculateViewWidth(viewMode: string, width: number) {
		switch (viewMode) {
			case "code":
				return "100%";
			case "pipeline":
				return "0px";
			default:
				return `${width}px`;
		}
	}

	return (
		<>
			<WelcomeModal open={openDialog} setOpen={setOpenDialog} />
			<div className="flex h-full max-h-screen min-h-screen flex-col">
				<ReactFlowProvider>
					<AppHeader />
					<div className="flex h-full w-full shrink grow">
						<div
							className={`relative flex shrink-0 flex-col`}
							style={{
								width: calculateViewWidth(viewMode, width),
							}}
						>
							<EditorTopBar config={currentConfig} font={firaCode} />
							<div className={`h-full w-full shrink grow ${firaCode.className}`}>
								{clerk.loaded && (
									<AutoSizer>
										{({ width, height }) => (
											<MonacoEditor
												defaultValue={config}
												value={config}
												onMount={editorDidMount}
												width={width}
												height={height}
												defaultLanguage="yaml"
												theme="OTelBin"
												options={{
													quickSuggestions: { other: true, strings: true },
													automaticLayout: true,
													minimap: { enabled: false },
													scrollbar: { verticalScrollbarSize: 8, horizontal: "hidden" },
													padding: { top: 5 },
													fontSize: 13,
													fontWeight: "400",
													fontFamily: firaCode.style.fontFamily,
												}}
												onChange={handleEditorChange}
											/>
										)}
									</AutoSizer>
								)}
							</div>
							{viewMode !== "pipeline" && <ValidationErrorConsole errors={totalValidationErrors} font={firaCode} />}
							{viewMode == "both" && <ResizeBar onWidthChange={onWidthChange} />}
						</div>
						<div className="z-0 min-h-full w-full shrink grow relative">
							<AutoSizer>
								{({ width, height }) => (
									<div style={{ width: `${width}px`, height: `${height}px` }}>
										<Flow
											value={(isValidConfig && currentConfig) || "{}"}
											openDialog={setOpenDialog}
											locked={locked}
											setLocked={setLocked}
											editorRef={editorRef}
										/>
									</div>
								)}
							</AutoSizer>

							{viewMode === "pipeline" && (
								<Tooltip>
									<TooltipTrigger asChild>
										<IconButton onClick={() => setViewMode("both")} size={"xs"} className="absolute top-4 left-4 z-1">
											<PanelLeftOpen />
										</IconButton>
									</TooltipTrigger>
									<TooltipContent>Show editor</TooltipContent>
								</Tooltip>
							)}
						</div>
					</div>
					<AppFooter />
				</ReactFlowProvider>
			</div>
		</>
	);
}
