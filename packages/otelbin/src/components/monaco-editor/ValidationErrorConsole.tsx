// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, useRef } from "react";
import { ChevronDown, XCircle, AlertTriangle } from "lucide-react";
import { type NextFont } from "next/dist/compiled/@next/font";
import type { YAMLParseError } from "yaml";

export interface IAjvError {
	message: string;
	line?: number | null;
}

export interface IServerSideError {
	message: string;
	error: string;
	line: number | null;
	path?: string[];
}

export interface IError {
	yamlError?: YAMLParseError;
	ajvErrors?: IAjvError[];
	customErrors?: string[];
	customWarnings?: string[];
	serverSideError?: IServerSideError;
}

interface State {
	dragging: boolean;
	initialY: number;
	initialHeight: number;
}

export default function ValidationErrorConsole({ errors, font }: { errors?: IError; font: NextFont }) {
	const validationConsoleDiv = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(170);
	const errorCount =
		(errors?.ajvErrors?.length ?? 0) +
		(errors?.yamlError != null ? 1 : 0) +
		(errors?.customErrors?.length ?? 0) +
		(errors?.serverSideError?.error ? 1 : 0);

	const warningsCount = errors?.customWarnings?.length ?? 0;
	const [isOpenErrorConsole, setIsOpenErrorConsole] = useState(false);

	useEffect(() => {
		if (errorCount === 0 && warningsCount === 0) {
			setIsOpenErrorConsole(false);
		}
	}, [errorCount, warningsCount]);

	const state = useRef<State>({
		dragging: false,
		initialY: 0,
		initialHeight: 0,
	});

	useEffect(() => {
		const onMouseUp = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			state.current.dragging = false;
		};

		const onMouseMove = (e: MouseEvent) => {
			e.stopPropagation();
			const viewportHeight = window.innerHeight;
			const minHeight = 0.3 * viewportHeight;
			const maxHeight = 0.8 * viewportHeight;
			const { dragging, initialY, initialHeight } = state.current;

			if (dragging && e.clientY < maxHeight && e.clientY > minHeight) {
				const deltaY = initialY - e.clientY;
				const newHeight = initialHeight + deltaY;
				setHeight(newHeight);
			}
		};

		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);

		return () => {
			window.removeEventListener("mouseup", onMouseUp);
			window.removeEventListener("mousemove", onMouseMove);
		};
	}, [state]);

	return (
		<div
			ref={validationConsoleDiv}
			style={{
				height: isOpenErrorConsole ? `${height}px` : `37px`,
				cursor: isOpenErrorConsole ? `row-resize` : `auto`,
				paddingTop: isOpenErrorConsole ? `8px` : `0px`,
				transition: state.current.dragging ? "none" : "height 0.2s ease-out",
			}}
			onMouseDown={(e) => {
				const rect = validationConsoleDiv.current?.getBoundingClientRect();
				const isTop = rect && e.clientY - rect?.top <= 15;
				if (e.button === 0 && isTop && isOpenErrorConsole) {
					state.current.initialY = e.clientY;
					state.current.initialHeight = height;
					state.current.dragging = true;
				}
			}}
			className="absolute bottom-0 left-0 bg-transparent w-full select-none overflow-hidden"
		>
			<div className={`relative w-full bg-default z-10 border-t-1 pt-[2px] border-subtle h-full pl-[25px]`}>
				<div className="flex flex-col cursor-auto h-full">
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
						<div
							style={{ wordWrap: "break-word" }}
							className="mt-2 flex h-[calc(100%-45px)] flex-col gap-y-1 overflow-y-auto overflow-x-hidden"
						>
							{errors?.customWarnings &&
								errors.customWarnings?.length > 0 &&
								errors.customWarnings.map((warning: string, index: number) => {
									return <ErrorMessage key={index} customWarnings={warning} font={font} />;
								})}
							{errors?.serverSideError?.error && <ErrorMessage serverSideError={errors.serverSideError} font={font} />}
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
							{errors?.yamlError?.linePos?.[0] && <ErrorMessage yamlError={errors?.yamlError} font={font} />}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function ErrorMessage({
	ajvError,
	yamlError,
	serverSideError,
	customErrors,
	customWarnings,
	font,
}: {
	ajvError?: IAjvError;
	yamlError?: YAMLParseError;
	serverSideError?: IServerSideError;
	customErrors?: string;
	customWarnings?: string;
	font: NextFont;
}) {
	const errorsStyle = "flex items-center gap-x-1 text-xs font-normal text-red-600 select-text mr-[20px]";
	const warningStyle = "flex items-center gap-x-1 text-xs font-normal text-yellow-300 select-text mr-[20px]";
	return (
		<>
			{customWarnings && (
				<div className={`${font.className} ${warningStyle}`}>
					<p className="max-w-[100%]">{`${customWarnings}`}</p>
				</div>
			)}
			{ajvError && (
				<div className={`${font.className} ${errorsStyle}`}>
					<p className="max-w-[100%]">{`${ajvError.message} ${
						(ajvError.line ?? 0) > 1 ? `(Line ${ajvError.line})` : ""
					}`}</p>
				</div>
			)}
			{customErrors && (
				<div className={`${font.className} ${errorsStyle}`}>
					<p className="max-w-[100%]">{`${customErrors}`}</p>
				</div>
			)}
			{yamlError ? (
				<div className={`${font.className} ${errorsStyle}`}>
					<p className="max-w-[100%]">{`${yamlError.message}`}</p>
				</div>
			) : (
				<></>
			)}
			{serverSideError ? (
				<div className={`${font.className} ${errorsStyle}`}>
					<p>{`${serverSideError.message} - ${serverSideError.error} ${
						(serverSideError.line ?? 0) > 1 ? `(Line ${serverSideError.line})` : ""
					}`}</p>
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
			min-h-[34px] w-full bg-default flex items-center gap-x-[1px] pr-3 pl-4 pb-1`}
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
			min-h-[32px] min-w-[100px] bg-default flex items-center gap-x-[1px] pr-2 pb-1`}
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
