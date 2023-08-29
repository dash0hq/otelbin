import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import { useConfigs } from "~/queries/config";
import type { IAjvError, IError } from "./ErrorConsole";
import { schema } from "../../schemas/JSONSchema";
import ErrorConsole from "./ErrorConsole";
import EditorTopBar from "../EditorTopBar";
import { DefaultConfig } from "../../config/DefaultConfig";
import {
  useEditorRef,
  useEditorDidMount,
  useMonacoRef,
} from "~/contexts/EditorContext";
import Editor from "@monaco-editor/react";
import JsYaml from "js-yaml";
import Ajv from "ajv";
import type { ErrorObject } from "ajv";
import { ReactFlowProvider } from "reactflow";
import Flow from "../react-flow/ReactFlow";
import { useMouseDelta } from "../../functions/MouseDelta";
import { useRouter } from "next/router";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import AppHeader from "../AppHeader";
import WelcomeModal from "../welcome-modal/WelcomeModal";

export default function MonacoEditor({ id }: { id?: string }) {
  const editorDidMount = useEditorDidMount();
  const editorRef = useEditorRef();
  const monacoRef = useMonacoRef();
  const [clicked, setClicked] = useState(false);
  const [data, setData] = useState({ name: "", config: "" });
  const [errors, setErrors] = useState<IError>({});
  const { data: configs } = useConfigs();
  const editorDivRef = useRef(null);
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

  useEffect(() => {
    setIsServer(true);
    if (config) {
      handleYamlValidation(config);
    }
  }, [config]);

  function handleYamlValidation(configData: string) {
    const ajv = new Ajv({ allErrors: true });
    const model = editorRef?.current?.getModel();
    let ajvError: IAjvError[] = [];
    try {
      const jsonData = JsYaml.load(configData);
      const valid = ajv.validate(schema, jsonData);
      if (!valid) {
        const errors = ajv.errors;

        if (errors) {
          const validationErrors = errors.map((error: ErrorObject) => {
            const errorInfo = {
              line: null as number | null,
              column: null as number | null,
              message: error.message || "Unknown error",
            };

            if (error instanceof JsYaml.YAMLException) {
              errorInfo.line = error.mark.line + 1;
              errorInfo.column = error.mark.column + 1;
            }

            return errorInfo;
          });
          ajvError.push(...validationErrors);
        }
      } else {
        ajvError = [];
      }
      setErrors({ ajvErrors: ajvError });

      monacoRef?.current?.editor.setModelMarkers(model, "json", []);
    } catch (error: any) {
      const errorLineNumber = error.mark.line;
      const errorColumn = error.mark.column;
      const errorMessage = error.reason;
      const errorMarker = {
        startLineNumber: errorLineNumber,
        endLineNumber: errorLineNumber,
        startColumn: errorColumn,
        endColumn: errorColumn,
        severity: monacoRef.current && monacoRef.current.MarkerSeverity.Error,
        message: errorMessage,
      };
      monacoRef.current?.editor.setModelMarkers(model, "json", [errorMarker]);

      setErrors({ jsYamlError: error });
    }
  }

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
                  handleYamlValidation(value || "");
                }}
              />
              <ErrorConsole errors={errors} />
            </div>
          ) : (
            <></>
          )}
          <div className="z-0 flex-grow-[3]" style={{ height: "94.5vh" }}>
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
              />
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </>
  );
}
