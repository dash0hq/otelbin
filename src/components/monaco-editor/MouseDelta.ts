import { useCallback, useEffect, useRef, useState } from "react";

export const useMouseDelta = (initialWidth: number, div: any
) => {
    const [result, setResult] = useState(initialWidth);
    const dragging = useRef(false);
    const previousClientX = useRef(0);

    const handleMouseMove = useCallback((e: MouseEvent

    ) => {
        if (!dragging.current) {
            return;
        }

        setResult((result) => {
            const change = e.clientX - previousClientX.current;
            previousClientX.current = e.clientX;
            return result + change;
        });
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent
    ) => {
        const rightEdge = div.current.getBoundingClientRect().right;
        if (e.clientX >= rightEdge - 20) {
            previousClientX.current = e.clientX;
            dragging.current = true;
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        dragging.current = false;
    }, []);

    const handleMouseOver = useCallback((e: MouseEvent) => {
        const rightEdge = div.current.getBoundingClientRect().right;
        if (e.clientX >= rightEdge - 20) {
            div.current.style.cursor = "col-resize";
        }
    }, []);

    useEffect(() => {
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [handleMouseDown, handleMouseUp, handleMouseMove, handleMouseOver]);

    return result;
};