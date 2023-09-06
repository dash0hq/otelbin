// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import XCircleIcon from "../../components/assets/svg/x-circle.svg";

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

export default function ErrorConsole({ errors }: { errors?: IError }) {
	const [isOpenErrorConsole, setIsOpenErrorConsole] = useState(false);
	return isOpenErrorConsole ? (
		<div className="absolute bottom-3 left-2 z-10 h-[20vh] w-[calc(100%-20px)] rounded-md bg-otelbinBlackGrey px-3 pb-1 pt-3">
			<p className="mb-2 text-xs font-bold text-otelbinLightGrey">Errors</p>
			<div className="flex h-[calc(100%-45px)] flex-col gap-y-1 overflow-auto">
				{errors?.ajvErrors &&
					errors.ajvErrors?.length > 0 &&
					errors.ajvErrors.map((error: any, index: any) => {
						return <Error key={index} error={error} />;
					})}

				{errors?.jsYamlError?.mark.line !== null && <Error jsYamlError={errors && errors.jsYamlError} />}
			</div>

			{errors ? <ErrorCount errors={errors} isOpen={isOpenErrorConsole} setOpen={setIsOpenErrorConsole} /> : <> </>}
		</div>
	) : (
		<ErrorCount errors={errors} isOpen={isOpenErrorConsole} setOpen={setIsOpenErrorConsole} />
	);
}

export function Error({ error, jsYamlError }: { error?: IAjvError; jsYamlError?: IJsYamlError }) {
	return (
		<>
			{error && (
				<div className="flex items-center gap-x-1 text-xs font-normal text-otelbinMagenta">
					<div className="mt-[5px] self-start p-0">
						<XCircleIcon />
					</div>
					<p>{`${error.message}`}</p>
				</div>
			)}
			{jsYamlError ? (
				<div className="flex items-center gap-x-1 text-xs font-normal text-otelbinMagenta">
					<div className="mt-[5px] self-start p-0">
						<XCircleIcon />
					</div>
					<p>{`${jsYamlError.reason} ${jsYamlError.mark && `(Line ${jsYamlError.mark.line})`}`}</p>
				</div>
			) : (
				<></>
			)}
		</>
	);
}

export function ErrorCount({
	errors,
	isOpen,
	setOpen,
}: {
	errors?: IError;
	isOpen: boolean;
	setOpen: (open: boolean) => void;
}) {
	const errorCount = (errors?.ajvErrors?.length ?? 0) + (errors?.jsYamlError != null ? 1 : 0);

	return (
		<div
			onClick={() => setOpen(!isOpen)}
			className={`${errorCount ? `text-otelbinMagenta` : `text-otelbinLightGrey`} ${
				!isOpen && "h-[26px] justify-center rounded-md bg-otelbinBlackGrey px-2"
			} absolute bottom-3 right-2 flex cursor-pointer items-center gap-x-1`}
		>
			<XCircleIcon />
			<p className="text-xs font-medium">{errorCount}</p>
		</div>
	);
}
