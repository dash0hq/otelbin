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
			e.preventDefault();
			e.stopPropagation();
			if (state.current.dragging && e.pageX > 400) {
				onWidthChange(e.pageX);
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
			className="absolute -right-[10px] bottom-0 top-0 z-10 w-[10px] cursor-col-resize"
			onMouseDown={(e) => {
				if (e.button === 0) {
					state.current.dragging = true;
				}
			}}
		>
			<div className="absolute bottom-0 left-0 top-0 w-px bg-divider-subtle" />
		</div>
	);
}
