// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { type EdgeProps, BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from "reactflow";

interface CyclicErrorEdgeProps extends EdgeProps {
	pathOptions?: {
		centerX: number;
		centerY: number;
		offset?: number;
		borderRadius?: number;
	};
}

export default function CyclicErrorEdge({
	id,
	sourceX,
	sourceY,
	sourcePosition,
	targetX,
	targetY,
	targetPosition,
	pathOptions,
	style,
	...props
}: CyclicErrorEdgeProps) {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		...pathOptions,
	});

	const [hovered, setHovered] = useState(false);

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				{...props}
				style={{
					...style,
					stroke: hovered ? "var(--color-critical-hover)" : style?.stroke,
				}}
			/>
			<EdgeLabelRenderer>
				<span
					style={{
						position: "absolute",
						transform: `translate(50%, -100%) translate(${labelX}px, ${labelY}px)`,
						pointerEvents: "all",
						...style,
						color: hovered ? "var(--color-critical-hover)" : style?.color,
					}}
					onMouseEnter={() => setHovered(true)}
					onMouseLeave={() => setHovered(false)}
				>
					CyclicError
				</span>
			</EdgeLabelRenderer>
		</>
	);
}
