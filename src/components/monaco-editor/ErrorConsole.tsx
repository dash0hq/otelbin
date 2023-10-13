// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { ChevronDown, XCircle, AlertTriangle } from "lucide-react";
import { type NextFont } from "next/dist/compiled/@next/font";
import { useServerSideValidation } from "../validation/useServerSideValidation";

export interface IAjvError {
	message: string;
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

export default function ErrorConsole({ errors, font }: { errors?: IError; font: NextFont }) {
	const errorCount =
		(errors?.ajvErrors?.length ?? 0) + (errors?.jsYamlError != null ? 1 : 0) + (errors?.customErrors?.length ?? 0);
	const warningsCount = errors?.customWarnings?.length ?? 0;
	const [isOpenErrorConsole, setIsOpenErrorConsole] = useState(false);

	const serverSideValidationResult = useServerSideValidation();
	console.log({ serverSideValidationResult });

	useEffect(() => {
		if (errorCount === 0) {
			setIsOpenErrorConsole(false);
		}
	}, [errorCount]);

	return (
		<div
			className={`absolute bottom-0 left-0 z-10 ${
				isOpenErrorConsole ? "h-[120px]" : "h-[37px]"
			} w-full border-t-1 border-subtle bg-default pb-1 pt-1 transition-all`}
		>
			<div className="flex flex-col h-full">
				<div className="flex items-center">
					<ErrorCount
						errorsCount={errorCount}
						warningsCount={0}
						isOpen={isOpenErrorConsole}
						setOpen={setIsOpenErrorConsole}
					/>
					<ErrorCount
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
								return <Error key={index} customWarnings={warning} font={font} />;
							})}
						{errors?.ajvErrors &&
							errors.ajvErrors?.length > 0 &&
							errors.ajvErrors.map((error: IAjvError, index: number) => {
								return <Error key={index} error={error} font={font} />;
							})}
						{errors?.customErrors &&
							errors.customErrors?.length > 0 &&
							errors.customErrors.map((error: string, index: number) => {
								return <Error key={index} customErrors={error} font={font} />;
							})}
						{errors?.jsYamlError?.mark.line !== null && (
							<Error jsYamlError={errors && errors.jsYamlError} font={font} />
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export function Error({
	error,
	jsYamlError,
	customErrors,
	customWarnings,
	font,
}: {
	error?: IAjvError;
	jsYamlError?: IJsYamlError;
	customErrors?: string;
	customWarnings?: string;
	font: NextFont;
}) {
	const errorsStyle = "flex items-center gap-x-1 text-xs font-normal text-red-600";
	const warningStyle = "flex items-center gap-x-1 text-xs font-normal text-yellow-300";
	return (
		<>
			{customWarnings && (
				<div className={`${font.className} ${warningStyle}`}>
					<p>{`${customWarnings}`}</p>
				</div>
			)}
			{error && (
				<div className={`${font.className} ${errorsStyle}`}>
					<p>{`${error.message}`}</p>
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
		</>
	);
}

export function ErrorCount({
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
						if (errorsCount > 0 || warningsCount || 0 > 0) {
							setOpen(!isOpen);
						}
					}}
					className={`${warningsCount ? `cursor-pointer text-yellow-300` : `text-subtl`}
			min-h-[32px] w-full bg-default flex items-center gap-x-[1px] pr-3 pl-5 pb-1`}
				>
					<AlertTriangle height={14.67} />
					<div className="flex w-full items-center justify-between">
						<p className="text-xs font-medium">{`${warningsCount} ${
							(warningsCount || 0) <= 1 ? `Warning` : `Warnings`
						}`}</p>
						{((warningsCount || 0) > 0 || errorsCount > 0) && <ChevronDown width={12} color="#64748b" />}
					</div>
				</div>
			) : (
				<div
					onClick={() => {
						if (errorsCount > 0 || warningsCount || 0 > 0) {
							setOpen(!isOpen);
						}
					}}
					className={`${errorsCount ? `cursor-pointer text-red-600` : `text-subtl`}
			min-h-[32px] min-w-[100px] bg-default flex items-center gap-x-[1px] pr-3 pl-5 pb-1`}
				>
					<XCircle height={14.67} />
					<div className="flex w-full items-center justify-between">
						<p className="text-xs font-medium">{`${errorsCount} ${errorsCount <= 1 ? `Error` : `Errors`}`}</p>
					</div>
				</div>
			)}
		</>
	);
}
