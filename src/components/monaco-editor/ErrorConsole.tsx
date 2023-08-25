import { useEffect, useState } from "react";
import XCircleIcon from "../../components/assets/svg/x-circle.svg";

export interface IAjvError {
  message: string;
}

export interface IJsYamlError {
  mark: {
    line: number;
  };
  reason: string;
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

        {errors?.jsYamlError && <Error jsYamlError={errors.jsYamlError} />}
      </div>

      {errors ? (
        <ErrorCount
          errors={errors}
          isOpen={isOpenErrorConsole}
          setOpen={setIsOpenErrorConsole}
        />
      ) : (
        <> </>
      )}
    </div>
  ) : (
    <ErrorCount
      errors={errors}
      isOpen={isOpenErrorConsole}
      setOpen={setIsOpenErrorConsole}
    />
  );
}

export function Error({
  error,
  jsYamlError,
}: {
  error?: IAjvError;
  jsYamlError?: IJsYamlError;
}) {
  return (
    <>
      {error && (
        <p className="flex items-center gap-x-1 text-xs font-normal text-otelbinMagenta">
          <div className="mt-[5px] self-start p-0">
            <XCircleIcon />
          </div>
          <p>{`${error.message}`}</p>
        </p>
      )}
      {jsYamlError ? (
        <p className="flex items-center gap-x-1 text-xs font-normal text-otelbinMagenta">
          <div className="mt-[5px] self-start p-0">
            <XCircleIcon />
          </div>
          <p>{`${jsYamlError.reason} ${
            jsYamlError.mark && `(Line ${jsYamlError.mark.line})`
          }`}</p>
        </p>
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
  const [errorCount, setErrorCount] = useState(0);

  function countErrors() {
    let errorCount = 0;
    if (errors?.jsYamlError !== undefined) {
      errorCount =
        (errors && errors.ajvErrors && errors.ajvErrors.length + 1) || 1;
      return errorCount;
    } else {
      errorCount = (errors && errors.ajvErrors && errors.ajvErrors.length) || 0;
      return errorCount;
    }
  }

  function handleClick() {
    setOpen(!isOpen);
  }

  useEffect(() => {
    setErrorCount(countErrors());
  }, [errors]);

  return (
    <div
      onClick={handleClick}
      className={`${
        errorCount ? `text-otelbinMagenta` : `text-otelbinLightGrey`
      } ${
        !isOpen && "h-[26px] justify-center rounded-md bg-otelbinBlackGrey px-2"
      } absolute bottom-3 right-2 flex cursor-pointer items-center gap-x-1`}
    >
      <XCircleIcon />
      <p className="text-xs font-medium">{errorCount}</p>
    </div>
  );
}