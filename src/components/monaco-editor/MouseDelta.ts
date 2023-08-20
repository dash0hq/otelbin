import { useCallback, useEffect, useRef, useState } from "react";

export const useMouseDelta = (initialWidth: number, div: any
) => {
    const [result, setResult] = useState(initialWidth);
    const dragging = useRef(false);
    const previousClientX = useRef(0);


    const saveLocalStorage = (width: number) => {
        localStorage.setItem('width', width.toString());
    }

    const handleMouseMove = useCallback((e: MouseEvent

    ) => {
        if (!dragging.current) {
            return;
        }

        setResult((result) => {
            const change = e.clientX - previousClientX.current;
            previousClientX.current = e.clientX;
            saveLocalStorage(result + change);
            return result + change;
        });
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent
    ) => {
        if (e.button === 0) {
        const rightEdge = div.current.getBoundingClientRect().right;
            if (e.clientX >= rightEdge - 4) {
            previousClientX.current = e.clientX;
            dragging.current = true;
        }
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        dragging.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [handleMouseDown, handleMouseUp, handleMouseMove]);

    return result;
};