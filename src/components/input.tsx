// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react";

import { cn } from "~/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

export const inputVariants = cva(
	"flex py-0 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				xs: "h-6 text-xs px-2",
				sm: "h-8 text-sm px-2",
				md: "h-10 text-sm px-3",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, size, type, ...props }, ref) => {
	return <input type={type} className={cn(inputVariants({ size }), className)} ref={ref} {...props} />;
});
Input.displayName = "Input";

export { Input };
