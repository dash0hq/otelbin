// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronDown, XCircle, AlertTriangle } from "lucide-react";
import { type NextFont } from "next/dist/compiled/@next/font";
import { useServerSideValidation } from "../validation/useServerSideValidation";

export interface IAjvError {
	message: string;
	line?: number | null;
}

export interface IJsYamlError {
	mark: {
		line: number | null;
	};
	reason: string | null;
}

export interface IError {
	jsYamlError?: IJsYamlError;
	ajvErrors?: IAjvError[];
	customErrors?: string[];
	customWarnings?: string[];
}

interface State {
	dragging: boolean;
	initialY: number;
	initialHeight: number;
}

export default function ValidationErrorConsole({ errors, font }: { errors?: IError; font: NextFont }) {
	const validationConsoleDiv = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(120);
	const serverSideValidationResult = useServerSideValidation();
	const errorCount =
		(errors?.ajvErrors?.length ?? 0) +
		(errors?.jsYamlError != null ? 1 : 0) +
		(errors?.customErrors?.length ?? 0) +
		(serverSideValidationResult.result?.error ? 1 : 0);

	const warningsCount = errors?.customWarnings?.length ?? 0;
	const [isOpenErrorConsole, setIsOpenErrorConsole] = useState(false);

	useEffect(() => {
		if (errorCount === 0 && warningsCount === 0) {
			setIsOpenErrorConsole(false);
		}
	}, [errorCount, warningsCount]);

	const onHeightChange = useCallback((newHeight: number) => {
		setHeight(newHeight);
	}, []);

	const state = useRef<State>({
		dragging: false,
		initialY: 0,
		initialHeight: 0,
	});

	useEffect(() => {
		const onMouseUp = () => {
			state.current.dragging = false;
		};

		const onMouseMove = (e: MouseEvent) => {
			e.stopPropagation();
			if (state.current.dragging && e.clientY < 700 && e.clientY > 300) {
				const deltaY = state.current.initialY - e.clientY;
				const newHeight = state.current.initialHeight + deltaY;
				onHeightChange(newHeight);
			}
		};

		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);

		return () => {
			window.removeEventListener("mouseup", onMouseUp);
			window.removeEventListener("mousemove", onMouseMove);
		};
	}, [state, onHeightChange]);

	return (
		<div
			ref={validationConsoleDiv}
			style={{
				height: isOpenErrorConsole ? `${height}px` : `37px`,
				cursor: isOpenErrorConsole ? `row-resize` : `auto`,
			}}
			onMouseDown={(e) => {
				const rect = validationConsoleDiv.current?.getBoundingClientRect();
				if (e.button === 0 && isOpenErrorConsole && rect && e.clientY < rect.top + 10) {
					state.current.dragging = true;
					state.current.initialY = e.clientY;
					state.current.initialHeight = height;
				}
			}}
			className={`absolute bottom-0 left-0 z-10 w-full border-t-1 border-subtle bg-default pb-1 pt-1 transition-all`}
		>
			<div className="flex flex-col h-full cursor-auto">
				<div className="flex items-center">
					<ErrorAndWarningCounter
						errorsCount={errorCount}
						warningsCount={0}
						isOpen={isOpenErrorConsole}
						setOpen={setIsOpenErrorConsole}
					/>
					<ErrorAndWarningCounter
						isWarning
						errorsCount={0}
						warningsCount={warningsCount}
						isOpen={isOpenErrorConsole}
						setOpen={setIsOpenErrorConsole}
					/>
				</div>
				{isOpenErrorConsole && (
					<div className="mt-2 flex h-[calc(100%-45px)] flex-col gap-y-1 overflow-auto px-[25px]">
						{errors?.customWarnings &&
							errors.customWarnings?.length > 0 &&
							errors.customWarnings.map((warning: string, index: number) => {
								return <ErrorMessage key={index} customWarnings={warning} font={font} />;
							})}
						{serverSideValidationResult.result?.error && (
							<ErrorMessage
								serverSideError={
									serverSideValidationResult.result?.message + " - " + serverSideValidationResult.result?.error
								}
								font={font}
							/>
						)}
						{errors?.ajvErrors &&
							errors.ajvErrors?.length > 0 &&
							errors.ajvErrors.map((error: IAjvError, index: number) => {
								return <ErrorMessage key={index} ajvError={error} font={font} />;
							})}
						{errors?.customErrors &&
							errors.customErrors?.length > 0 &&
							errors.customErrors.map((error: string, index: number) => {
								return <ErrorMessage key={index} customErrors={error} font={font} />;
							})}
						{errors?.jsYamlError?.mark?.line && <ErrorMessage jsYamlError={errors?.jsYamlError} font={font} />}
					</div>
				)}
			</div>
		</div>
	);
}

export function ErrorMessage({
	ajvError,
	jsYamlError,
	serverSideError,
	customErrors,
	customWarnings,
	font,
}: {
	ajvError?: IAjvError;
	jsYamlError?: IJsYamlError;
	serverSideError?: string;
	customErrors?: string;
	customWarnings?: string;
	font: NextFont;
}) {
	const errorsStyle = "flex items-center gap-x-1 text-xs font-normal text-red-600 select-text";
	const warningStyle = "flex items-center gap-x-1 text-xs font-normal text-yellow-300 select-text";
	return (
		<>
			{customWarnings && (
				<div className={`${font.className} ${warningStyle}`}>
					<p>{`${customWarnings}`}</p>
				</div>
			)}
			{ajvError && (
				<div className={`${font.className} ${errorsStyle}`}>
					<p>{`${ajvError.message} ${(ajvError.line ?? 0) > 1 ? `(Line ${ajvError.line})` : ""}`}</p>
				</div>
			)}
			{customErrors && (
				<div className={`${font.className} ${errorsStyle}`}>
					<p>{`${customErrors}`}</p>
				</div>
			)}
			{jsYamlError ? (
				<div className={`${font.className} ${errorsStyle}`}>
					<p>{`${jsYamlError.reason} ${jsYamlError.mark && `(Line ${jsYamlError.mark.line})`}`}</p>
				</div>
			) : (
				<></>
			)}
			{serverSideError ? (
				<div className={`${font.className} ${errorsStyle}`}>
					<p>{`Server-side: ${serverSideError}`}</p>
				</div>
			) : (
				<></>
			)}
		</>
	);
}

export function ErrorAndWarningCounter({
	errorsCount,
	warningsCount,
	isOpen,
	isWarning,
	setOpen,
}: {
	errorsCount: number;
	warningsCount?: number;
	isOpen: boolean;
	isWarning?: boolean;
	setOpen: (open: boolean) => void;
}) {
	return (
		<>
			{isWarning ? (
				<div
					onClick={() => {
						if (errorsCount || warningsCount) {
							setOpen(!isOpen);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setOpen(!isOpen);
						}
					}}
					className={`${warningsCount ? `cursor-pointer text-yellow-300` : `text-subtl`}
			min-h-[32px] w-full bg-default flex items-center gap-x-[1px] pr-3 pl-5 pb-1`}
				>
					<AlertTriangle height={14.67} />
					<div className="flex w-full items-center justify-between">
						<p className="text-xs font-medium">{`${warningsCount} ${
							(warningsCount || 0) === 1 ? `Warning` : `Warnings`
						}`}</p>
						{Boolean(warningsCount) || Boolean(errorsCount) ? <ChevronDown width={12} color="#64748b" /> : <></>}
					</div>
				</div>
			) : (
				<div
					onClick={() => {
						if (errorsCount || warningsCount) {
							setOpen(!isOpen);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setOpen(!isOpen);
						}
					}}
					className={`${errorsCount ? `cursor-pointer text-red-600` : `text-subtl`}
			min-h-[32px] min-w-[100px] bg-default flex items-center gap-x-[1px] pr-3 pl-5 pb-1`}
				>
					<XCircle height={14.67} />
					<div className="flex w-full items-center justify-between">
						<p className="text-xs font-medium">{`${errorsCount} ${errorsCount === 1 ? `Error` : `Errors`}`}</p>
					</div>
				</div>
			)}
		</>
	);
}
