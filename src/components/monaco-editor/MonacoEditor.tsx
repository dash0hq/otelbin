// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import type { IError } from "./ErrorConsole";
import ErrorConsole from "./ErrorConsole";
import EditorTopBar from "../EditorTopBar";
import { useEditorRef, useEditorDidMount, useMonacoRef, useViewMode } from "~/contexts/EditorContext";
import Editor, { type OnChange } from "@monaco-editor/react";
import { ReactFlowProvider } from "reactflow";
import Flow from "../react-flow/ReactFlow";
import { useMouseDelta } from "~/components/monaco-editor/MouseDelta";
import { useRouter } from "next/navigation";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import AppHeader from "../AppHeader";
import WelcomeModal from "../welcome-modal/WelcomeModal";
import { validateOtelCollectorConfigurationAndSetMarkers } from "~/components/monaco-editor/otelCollectorConfigValidation";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { AppFooter } from "~/components/AppFooter";
import { useAuth } from "@clerk/nextjs";
import { AutoSizer } from "~/components/AutoSizer";

export default function MonacoEditor({ locked, setLocked }: { locked: boolean; setLocked: (locked: boolean) => void }) {
	const editorDidMount = useEditorDidMount();
	const editorDivRef = useRef(null);
	const editorRef = useEditorRef();
	const monacoRef = useMonacoRef();
	const savedWidth = typeof window !== "undefined" ? localStorage.getItem("width") : "";
	const width = useMouseDelta(Number(savedWidth) || 440, editorDivRef);
	const [isClient, setIsClient] = useState<boolean>(false);
	const router = useRouter();
	const { viewMode } = useViewMode();
	const savedOpenModal = Boolean(typeof window !== "undefined" && localStorage.getItem("welcomeModal"));
	const [openDialog, setOpenDialog] = useState(savedOpenModal ? !savedOpenModal : true);
	const [{ config }, getLink] = useUrlState([editorBinding]);
	const [currentConfig, setCurrentConfig] = useState<string>(config);

	const onChangeConfig = useCallback(
		(newConfig: string) => {
			router.replace(getLink({ config: newConfig }), { scroll: false });
		},
		[getLink, router]
	);

	// Only load the Monaco editor once Clerk has finished loading. Otherwise,
	// Clerk may fail to load.
	// https://github.com/clerkinc/javascript/issues/1643
	const authResult = useAuth();
	useEffect(() => setIsClient(authResult.isLoaded), [authResult.isLoaded]);

	const errors = useMemo((): IError => {
		if (isClient) {
			return validateOtelCollectorConfigurationAndSetMarkers(config, editorRef, monacoRef);
		} else {
			return {};
		}
	}, [config, editorRef, monacoRef, isClient]);

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
			{isClient ? <WelcomeModal open={openDialog} setOpen={setOpenDialog} /> : <></>}
			<div className="flex h-full max-h-screen min-h-screen flex-col">
				<AppHeader activeView={viewMode} />
				<div className="flex h-full w-full shrink grow">
					{isClient && (
						<div
							ref={editorDivRef}
							className={`relative flex shrink-0 select-none flex-col border-otelbinDarkBlue2 hover:border-otelbinDarkBlue3
              ${viewMode === "both" ? "border-r-[8px]" : "border-r-[0px]"}`}
							style={{
								width: viewMode === "code" ? "100%" : viewMode === "pipeline" ? "0px" : `${width}px`,
								cursor: viewMode === "both" ? "col-resize" : "default",
							}}
						>
							<EditorTopBar config={config} />
							<div className="h-full w-full shrink grow">
								<AutoSizer>
									{({ width, height }) => (
										<Editor
											defaultValue={config}
											value={config}
											onMount={editorDidMount}
											width={width}
											height={height}
											defaultLanguage="yaml"
											theme="vs-dark"
											options={{
												quickSuggestions: { other: true, strings: true },
												automaticLayout: true,
												minimap: { enabled: false },
												scrollbar: { verticalScrollbarSize: 5 },
												padding: { top: 5 },
											}}
											onChange={handleEditorChange}
										/>
									)}
								</AutoSizer>
							</div>
							<ErrorConsole errors={errors} />
						</div>
					)}

					<div className="z-0 min-h-full w-full shrink grow">
						<ReactFlowProvider>
							<AutoSizer>
								{({ width, height }) => (
									<div style={{ width: `${width}px`, height: `${height}px` }}>
										<Flow
											value={(isClient && isValidConfig && config) || "{}"}
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
