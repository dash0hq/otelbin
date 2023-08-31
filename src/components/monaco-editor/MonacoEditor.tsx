import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import { useConfigs } from "~/queries/config";
import type { IError } from "./ErrorConsole";
import ErrorConsole from "./ErrorConsole";
import EditorTopBar from "../EditorTopBar";
import { DefaultConfig } from "../../config/DefaultConfig";
import {
  useEditorRef,
  useEditorDidMount,
  useMonacoRef,
} from "~/contexts/EditorContext";
import Editor from "@monaco-editor/react";
import { ReactFlowProvider } from "reactflow";
import Flow from "../react-flow/ReactFlow";
import { useMouseDelta } from "../../functions/MouseDelta";
import { useRouter } from "next/router";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import AppHeader from "../AppHeader";
import WelcomeModal from "../welcome-modal/WelcomeModal";
import { YamlValidation } from "~/functions/YamlValidation";

export default function MonacoEditor({
  id,
  locked,
  setLocked,
}: {
  id?: string;
  locked: boolean;
  setLocked: (locked: boolean) => void;
}) {
  const editorDidMount = useEditorDidMount();
  const [clicked, setClicked] = useState(false);
  const [data, setData] = useState({ name: "", config: "" });
  const [errors, setErrors] = useState<IError>({});
  const { data: configs } = useConfigs();
  const editorDivRef = useRef(null);
  const editorRef = useEditorRef();
  const monacoRef = useMonacoRef();
  const savedWidth =
    typeof window !== "undefined" ? localStorage.getItem("width") : "";
  const width = useMouseDelta(Number(savedWidth) || 440, editorDivRef);
  const [isServer, setIsServer] = useState<boolean>(false);
  const router = useRouter();
  const [activeView, setActiveView] = useState("both");
  const savedOpenModal = Boolean(
    typeof window !== "undefined" && localStorage.getItem("welcomeModal")
  );
  const [openDialog, setOpenDialog] = useState(
    savedOpenModal ? !savedOpenModal : true
  );

  const editorBinding = {
    prefix: "",
    name: "config",
    fallback: data.config.trim() as string,
  } as const;

  const [{ config }, getLink] = useUrlState([editorBinding]);

  const onChangeConfig = useCallback(
    (newConfig: string) => {
      router.replace(getLink({ config: newConfig }));
    },
    [getLink, router]
  );

  function validate(config: string) {
    YamlValidation(config, editorRef, monacoRef).ajvErrors?.length > 0 ||
    YamlValidation(config, editorRef, monacoRef).jsYamlError?.mark.line !== null
      ? setErrors(YamlValidation(config, editorRef, monacoRef))
      : setErrors({});
  }

  useEffect(() => {
    setIsServer(true);
    if (config) {
      validate(config);
    }
  }, [config]);

  return (
    <>
      {isServer ? (
        <WelcomeModal open={openDialog} setOpen={setOpenDialog} />
      ) : (
        <></>
      )}
      <div className="flex h-full flex-col">
        <AppHeader activeView={activeView} setView={setActiveView} />
        <div className="flex">
          {isServer ? (
            <div
              ref={editorDivRef}
              className={`relative flex select-none flex-col border-otelbinDarkBlue2 hover:border-otelbinDarkBlue3 
              ${activeView === "both" ? "border-r-[8px]" : "border-r-[0px]"}`}
              style={{
                width:
                  activeView === "code"
                    ? "100%"
                    : activeView === "pipeline"
                    ? "0px"
                    : `${width}px`,
                cursor: activeView === "both" ? "col-resize" : "default",
              }}
            >
              <EditorTopBar />
              <Editor
                defaultValue={config.length ? config : DefaultConfig}
                value={
                  !clicked
                    ? (configs &&
                        configs?.length > 0 &&
                        configs.filter(
                          (config) => config.id?.toString() === id
                        )[0]?.config) ||
                      data.config
                    : data.config
                }
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
                  setData({
                    name: data.name,
                    config: value || "",
                  });
                  onChangeConfig(value || "");
                  validate(value || "");
                }}
              />
              <ErrorConsole errors={errors} />
            </div>
          ) : (
            <></>
          )}
          <div className="z-0 flex-grow-[3]" style={{ height: "94.5vh" }}>
            {editorRef?.current && (
              <ReactFlowProvider>
                <Flow
                  value={
                    (errors?.jsYamlError === undefined &&
                      errors.ajvErrors?.length === 0 &&
                      configs &&
                      configs?.length > 0 &&
                      config) ||
                    config ||
                    DefaultConfig
                  }
                  openDialog={setOpenDialog}
                  locked={locked}
                  setLocked={setLocked}
                  editorRef={editorRef}
                />
              </ReactFlowProvider>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
