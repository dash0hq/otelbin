import { useEffect, useState } from 'react';
import XCircleIcon from '../../components/assets/svg/x-circle.svg'

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

export default function ErrorConsole(
    {
        errors,
    }
        : {
            errors?: IError;
        }) {

    const [isOpenErrorConsole, setIsOpenErrorConsole] = useState(false)
    return (
        isOpenErrorConsole
            ? (<div className='absolute bg-otelbinBlackGrey bottom-3 z-10 w-[calc(100%-27px)] left-2 h-[20vh] rounded-md px-3 pt-3 pb-1'>
                <p className='text-otelbinLightGrey text-xs font-bold mb-2'>
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
                        <ErrorCount errors={errors} isOpen={isOpenErrorConsole} setOpen={setIsOpenErrorConsole} />
                    )
                    : (<> </>)
                }
            </div>)
            : (<ErrorCount errors={errors} isOpen={isOpenErrorConsole} setOpen={setIsOpenErrorConsole} />)

    )
}


export function Error(
    { error, jsYamlError }
        : {
            error?: IAjvError;
            jsYamlError?: IJsYamlError
        }) {

    return (
        <>
            {
                error &&
                <p className='text-otelbinMagenta text-xs font-normal flex items-center gap-x-1'>

                    <div className='p-0 self-start mt-[5px]'><XCircleIcon /></div>
                    <p>{`${error.message}`}</p>
                </p>
            }
            {
                jsYamlError
                    ? (
                        <p className='text-otelbinMagenta text-xs font-normal flex items-center gap-x-1'>
                            <div className='p-0 self-start mt-[5px]'><XCircleIcon /></div>
                            <p>{`${jsYamlError.reason} ${jsYamlError.mark && `(Line ${jsYamlError.mark.line})`}`}</p>
                        </p>)

                    : (<></>)
            }
        </>
    )
}

export function ErrorCount(
    { errors, isOpen, setOpen }
        : {
            errors?: IError;
            isOpen: boolean,
            setOpen: (open: boolean) => void
        }) {

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

    function handleClick() {
        setOpen(!isOpen)
    }

    useEffect(() => {
        setErrorCount(countErrors())
    }, [errors])

    return (
        <div
            onClick={handleClick}
            className={`${errorCount ? `text-otelbinMagenta` : `text-otelbinLightGrey`} ${!isOpen && 'h-[26px] px-2 justify-center bg-otelbinBlackGrey rounded-md'} absolute right-4 bottom-3 flex items-center gap-x-1 cursor-pointer`}>
            <XCircleIcon />
            <p className='text-xs font-medium'>
                {errorCount}
            </p>
        </div>
    )
}