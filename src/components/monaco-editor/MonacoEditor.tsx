// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import type { IError } from "./ErrorConsole";
import ErrorConsole from "./ErrorConsole";
import EditorTopBar from "../EditorTopBar";
import { useEditorRef, useEditorDidMount, useMonacoRef, useViewMode } from "~/contexts/EditorContext";
import Editor, { type OnChange } from "@monaco-editor/react";
import { ReactFlowProvider } from "reactflow";
import Flow from "../react-flow/ReactFlow";
import { useRouter } from "next/navigation";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import AppHeader from "../AppHeader";
import WelcomeModal from "../welcome-modal/WelcomeModal";
import { validateOtelCollectorConfigurationAndSetMarkers } from "~/components/monaco-editor/otelCollectorConfigValidation";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { AppFooter } from "~/components/AppFooter";
import { useAuth } from "@clerk/nextjs";
import { AutoSizer } from "~/components/AutoSizer";
import { ResizeBar } from "~/components/monaco-editor/ResizeBar";
import { Fira_Code } from "next/font/google";

const firaCode = Fira_Code({
	display: "swap",
	adjustFontFallback: false,
	subsets: ["latin"],
});

export default function MonacoEditor({ locked, setLocked }: { locked: boolean; setLocked: (locked: boolean) => void }) {
	const editorDidMount = useEditorDidMount();
	const editorRef = useEditorRef();
	const monacoRef = useMonacoRef();
	const [width, setWidth] = useState(Number(localStorage.getItem("width") || 440));
	const router = useRouter();
	const { viewMode } = useViewMode();
	const savedOpenModal = Boolean(typeof window !== "undefined" && localStorage.getItem("welcomeModal"));
	const [openDialog, setOpenDialog] = useState(savedOpenModal ? !savedOpenModal : true);
	const [{ config }, getLink] = useUrlState([editorBinding]);
	const [currentConfig, setCurrentConfig] = useState<string>(config);

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
		[getLink, router]
	);

	const errors = useMemo((): IError => {
		return validateOtelCollectorConfigurationAndSetMarkers(currentConfig, editorRef, monacoRef);
	}, [currentConfig, editorRef, monacoRef]);

	const isValidConfig = errors.jsYamlError == null && (errors.ajvErrors?.length ?? 0) === 0;

	const handleEditorChange: OnChange = (value) => {
		setCurrentConfig(value || "");
	};

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

	return (
		<>
			<WelcomeModal open={openDialog} setOpen={setOpenDialog} />
			<div className="flex h-full max-h-screen min-h-screen flex-col">
				<AppHeader activeView={viewMode} />
				<div className="flex h-full w-full shrink grow">
					<div
						className={`relative flex shrink-0 select-none flex-col`}
						style={{
							width: viewMode === "code" ? "100%" : viewMode === "pipeline" ? "0px" : `${width}px`,
						}}
					>
						<EditorTopBar config={config} />
						<div className={`h-full w-full shrink grow ${firaCode.className}`}>
							<AutoSizer>
								{({ width, height }) => (
									<Editor
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
						</div>
						{viewMode !== "pipeline" && <ErrorConsole errors={errors} font={firaCode} />}
						{viewMode == "both" && <ResizeBar onWidthChange={onWidthChange} />}
					</div>

					<div className="z-0 min-h-full w-full shrink grow">
						<ReactFlowProvider>
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
						</ReactFlowProvider>
					</div>
				</div>
				<AppFooter />
			</div>
		</>
	);
}
