// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { ChevronDown, XCircle } from "lucide-react";
import { type NextFont } from "next/dist/compiled/@next/font";

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
}

export default function ErrorConsole({ errors, font }: { errors?: IError; font: NextFont }) {
	const errorCount = (errors?.ajvErrors?.length ?? 0) + (errors?.jsYamlError != null ? 1 : 0);
	const [isOpenErrorConsole, setIsOpenErrorConsole] = useState(false);

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
				<ErrorCount errorsCount={errorCount} isOpen={isOpenErrorConsole} setOpen={setIsOpenErrorConsole} />
				{isOpenErrorConsole && (
					<div className="mt-2 flex h-[calc(100%-45px)] flex-col gap-y-1 overflow-auto px-[25px]">
						{errors?.ajvErrors &&
							errors.ajvErrors?.length > 0 &&
							errors.ajvErrors.map((error: IAjvError, index: number) => {
								return <Error key={index} error={error} font={font} />;
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

export function Error({ error, jsYamlError, font }: { error?: IAjvError; jsYamlError?: IJsYamlError; font: NextFont }) {
	return (
		<>
			{error && (
				<div className={`${font.className} flex items-center gap-x-1 text-xs font-normal text-otelbinRed`}>
					<p>{`${error.message}`}</p>
				</div>
			)}
			{jsYamlError ? (
				<div className={`${font.className} flex items-center gap-x-1 text-xs font-normal text-otelbinRed`}>
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
	isOpen,
	setOpen,
}: {
	errorsCount: number;
	isOpen: boolean;
	setOpen: (open: boolean) => void;
}) {
	return (
		<div
			onClick={() => {
				if (errorsCount > 0) {
					setOpen(!isOpen);
				}
			}}
			className={`${
				errorsCount ? `cursor-pointer text-otelbinRed` : `text-subtl`
			} min-h-[32px] w-full bg-default flex items-center gap-x-[1px] pr-3 pl-5 pb-1`}
		>
			<XCircle height={14.67} />
			<div className="flex w-full items-center justify-between">
				<p className="text-xs font-medium">{`${errorsCount} ${errorsCount <= 1 ? `Error` : `Errors`}`}</p>
				{errorsCount > 0 && <ChevronDown width={12} color="#64748b" />}
			</div>
		</div>
	);
}
