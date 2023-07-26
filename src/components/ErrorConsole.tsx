//SVG
import { useEffect, useState } from 'react';
import XCircleIcon from '../components/assets/svg/x-circle.svg'

export interface IAjvError {
    message: string;
}

export interface IJsYamlError {
    mark: {
        line: number;
    }
    reason: string;
}

export interface IError {
    jsYamlError?: IJsYamlError;
    ajvErrors?: IAjvError[];
}

export default function ErrorConsole({ errors }: { errors?: IError; }) {

    return (

        <div className='absolute bg-[#030816] left-2 bottom-3 z-10 w-[97%] h-[20vh] rounded-md px-3 pt-3 pb-1'>
            <p className='text-[#8491A6] text-xs font-bold mb-2'>
                Errors
            </p>
            <div className='h-[calc(100%-45px)] flex overflow-scroll flex-col gap-y-1'>
                {errors?.ajvErrors && errors.ajvErrors?.length > 0 && errors.ajvErrors.map((error: any, index: any) => {
                    return (
                        <Error key={index} error={error} />
                    )
                })}

                {errors?.jsYamlError &&
                    <Error jsYamlError={errors.jsYamlError} />
                }

            </div>

            {errors
                ? (
                    <ErrorCount errors={errors} />
                )
                : (<> </>)
            }
        </div>
    )
}


export function Error({ error, jsYamlError }: { error?: IAjvError; jsYamlError?: IJsYamlError }) {

    return (
        <>
            {
                error &&
                <p className='text-[#C93A76] text-xs font-normal flex items-center gap-x-1'>
                    <XCircleIcon />
                    <p>{`${error.message}`}</p>
                </p>
            }
            {
                jsYamlError
                    ? (
                        <p className='text-[#C93A76] text-xs font-normal flex items-center gap-x-1'>
                            <XCircleIcon />
                            <p>{`${jsYamlError.reason} ${jsYamlError.mark && `(Line ${jsYamlError.mark.line})`}`}</p>
                        </p>)

                    : (<></>)
            }
        </>
    )
}

export function ErrorCount({ errors }: { errors?: IError; }) {

    const [errorCount, setErrorCount] = useState(0)

    function countErrors() {
        let errorCount = 0
        if (errors?.jsYamlError !== undefined) {
            errorCount = errors && errors.ajvErrors && errors.ajvErrors.length + 1 || 1
            return errorCount
        } else {
            errorCount = errors && errors.ajvErrors && errors.ajvErrors.length || 0
            return errorCount
        }
    }

    useEffect(() => {
        setErrorCount(countErrors())
    }, [errors])

    return (
        <div className='absolute right-2 bottom-2 text-white flex items-center gap-x-1'>
            <XCircleIcon />
            <p className='text-[#C93A76] text-xs font-medium'>
                {errorCount}
            </p>
        </div>
    )
}