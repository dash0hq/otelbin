// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from "react";

interface ResizeBarProps {
	onWidthChange: (width: number) => void;
}

interface State {
	dragging: boolean;
}

export function ResizeBar({ onWidthChange }: ResizeBarProps) {
	const state = useRef<State>({
		dragging: false,
	});

	useEffect(() => {
		const onMouseUp = () => {
			state.current.dragging = false;
		};

		const onMouseMove = (e: MouseEvent) => {
			if (state.current.dragging) {
				onWidthChange(e.screenX);
			}
		};

		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);

		return () => {
			window.removeEventListener("mouseup", onMouseUp);
			window.removeEventListener("mousemove", onMouseMove);
		};
	}, [state, onWidthChange]);

	return (
		<div
			className="absolute -right-[8px] bottom-0 top-0 z-10 w-[8px] cursor-col-resize border-r-[7px] border-neutral-100 bg-divider-subtle"
			onMouseDown={(e) => {
				if (e.button === 0) {
					state.current.dragging = true;
				}
			}}
		/>
	);
}
