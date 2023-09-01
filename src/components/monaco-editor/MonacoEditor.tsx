import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import type { IError } from "./ErrorConsole";
import ErrorConsole from "./ErrorConsole";
import EditorTopBar from "../EditorTopBar";
import { useEditorRef, useEditorDidMount, useMonacoRef } from "~/contexts/EditorContext";
import Editor from "@monaco-editor/react";
import { ReactFlowProvider } from "reactflow";
import Flow from "../react-flow/ReactFlow";
import { useMouseDelta } from "~/components/monaco-editor/MouseDelta";
import { useRouter } from "next/navigation";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import AppHeader from "../AppHeader";
import WelcomeModal from "../welcome-modal/WelcomeModal";
import { validateOtelCollectorConfigurationAndSetMarkers } from "~/components/monaco-editor/otelCollectorConfigValidation";
import { editorBinding } from "~/components/monaco-editor/editorBinding";

export default function MonacoEditor({ locked, setLocked }: { locked: boolean; setLocked: (locked: boolean) => void }) {
	const editorDidMount = useEditorDidMount();
	const editorDivRef = useRef(null);
	const editorRef = useEditorRef();
	const monacoRef = useMonacoRef();
	const savedWidth = typeof window !== "undefined" ? localStorage.getItem("width") : "";
	const width = useMouseDelta(Number(savedWidth) || 440, editorDivRef);
	const [isClient, setIsClient] = useState<boolean>(false);
	const router = useRouter();
	const [activeView, setActiveView] = useState("both");
	const savedOpenModal = Boolean(typeof window !== "undefined" && localStorage.getItem("welcomeModal"));
	const [openDialog, setOpenDialog] = useState(savedOpenModal ? !savedOpenModal : true);
	const [{ config }, getLink] = useUrlState([editorBinding]);

	const onChangeConfig = useCallback(
		(newConfig: string) => {
			router.replace(getLink({ config: newConfig }));
		},
		[getLink, router]
	);

	useEffect(() => setIsClient(true), []);

	const errors = useMemo((): IError => {
		if (isClient) {
			return validateOtelCollectorConfigurationAndSetMarkers(config, editorRef, monacoRef);
		} else {
			return {};
		}
	}, [config, editorRef, monacoRef, isClient]);

	const isValidConfig = errors.jsYamlError == null && (errors.ajvErrors?.length ?? 0) === 0;

	return (
		<>
			{isClient ? <WelcomeModal open={openDialog} setOpen={setOpenDialog} /> : <></>}
			<div className="flex h-full flex-col">
				<AppHeader activeView={activeView} setView={setActiveView} />
				<div className="flex">
					{isClient && (
						<div
							ref={editorDivRef}
							className={`relative flex select-none flex-col border-otelbinDarkBlue2 hover:border-otelbinDarkBlue3
              ${activeView === "both" ? "border-r-[8px]" : "border-r-[0px]"}`}
							style={{
								width: activeView === "code" ? "100%" : activeView === "pipeline" ? "0px" : `${width}px`,
								cursor: activeView === "both" ? "col-resize" : "default",
							}}
						>
							<EditorTopBar config={config} />
							<Editor
								defaultValue={config}
								value={config}
								onMount={editorDidMount}
								height="94.5vh"
								width={"100%"}
								defaultLanguage="yaml"
								theme="vs-dark"
								options={{
									automaticLayout: true,
									minimap: { enabled: false },
									scrollbar: { verticalScrollbarSize: 5 },
									padding: { top: 10 },
								}}
								onChange={(value) => {
									onChangeConfig(value || "");
								}}
							/>
							<ErrorConsole errors={errors} />
						</div>
					)}

					<div className="z-0 flex-grow-[3]" style={{ height: "94.5vh" }}>
						<ReactFlowProvider>
							<Flow
								value={(isClient && isValidConfig && config) || "{}"}
								openDialog={setOpenDialog}
								locked={locked}
								setLocked={setLocked}
								editorRef={editorRef}
							/>
						</ReactFlowProvider>
					</div>
				</div>
			</div>
		</>
	);
}
