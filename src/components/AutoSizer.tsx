// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState, type ReactNode } from "react";
import { useSize } from "@radix-ui/react-use-size";
import { cn } from "~/lib/utils";

export interface Size {
	width: number;
	height: number;
}

export interface AutoSizerProps {
	children: (dimensions: Size) => ReactNode;
	/**
	 * When the surrounding element doesn't specify a height, then the automatic
	 * height discovery doesn't work. In those cases, you can use the `className`
	 * prop to define a fixed height.
	 */
	className?: string;
}

/**
 * Usage Example when the surrounding element defines a max height.
 *
 * <AutoSizer>{(size) => <MyComponent size={size} />}</AutoSizer>
 *
 * If the surrounding element does not define a maximum height, then you will
 * need to pass a height to AutoSizer. Example:
 *
 * <AutoSizer className="h-40">{(size) => <MyComponent size={size} />}</AutoSizer>
 */
export function AutoSizer({ children, className }: AutoSizerProps) {
	const [element, setElement] = useState<HTMLDivElement | null>(null);
	const size = useSize(element);

	return (
		<div ref={setElement} className={cn("relative h-full w-full", className)}>
			<div className="absolute bottom-0 left-0 right-0 top-0">{size != null && children(size)}</div>
		</div>
	);
}
