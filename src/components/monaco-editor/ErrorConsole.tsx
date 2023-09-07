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

	return isOpenErrorConsole ? (
		<div className="absolute bottom-0 left-0 z-10 h-[15vh] w-full border-t-1 border-subtle bg-default px-3 pb-1 pt-1">
			{errors ? (
				<ErrorCount errorsCount={errorCount} isOpen={isOpenErrorConsole} setOpen={setIsOpenErrorConsole} />
			) : (
				<> </>
			)}
			<div className="mt-2 flex h-[calc(100%-45px)] flex-col gap-y-1 overflow-auto px-1">
				{errors?.ajvErrors &&
					errors.ajvErrors?.length > 0 &&
					errors.ajvErrors.map((error: any, index: any) => {
						return <Error key={index} error={error} font={font} />;
					})}

				{errors?.jsYamlError?.mark.line !== null && <Error jsYamlError={errors && errors.jsYamlError} font={font} />}
			</div>
		</div>
	) : (
		<ErrorCount errorsCount={errorCount} isOpen={isOpenErrorConsole} setOpen={setIsOpenErrorConsole} />
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
			className={`${errorsCount ? `cursor-pointer text-otelbinRed` : `text-subtl`} ${
				!isOpen && "absolute h-[32px] w-full border-t-1 border-subtle bg-default px-[11px] py-2"
			}  bottom-0 right-0 z-50 flex items-center gap-x-[1px]`}
		>
			<XCircle height={14.67} />
			<div className="flex w-full items-center justify-between">
				<p className="text-xs font-medium">{`${errorsCount} ${errorsCount <= 1 ? `Error` : `Errors`}`}</p>
				{errorsCount > 0 && <ChevronDown width={12} color="#64748b" />}
			</div>
		</div>
	);
}
