import { cn } from "../../lib/utils"
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";

export const iconButtonVariants = cva(
	"group/icon-button inline-flex border items-center shrink-0 justify-center rounded-button text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-button text-button border-button shadow-sm hover:text-button-hover active:text-button-active hover:bg-button-hover active:bg-button-active disabled:opacity-50 [&>svg]:text-button-icon [&:hover>svg]:text-button-icon-hover [&:active>svg]:text-button-icon-active",
				outline:
					"border-button-outline text-button-outline hover:text-button-outline-hover active:text-button-outline-active hover:border-button-outline-hover active:border-button-outline-active focus-visible:ring-offset-0 [&>svg]:text-button-outline-icon [&:hover>svg]:text-button-outline-icon-hover [&:active>svg]:text-button-outline-icon-active",
				transparent:
					"bg-button-transparent text-button-transparent hover:text-button-transparent-hover active:text-button-transparent-active border-button-transparent hover:bg-button-transparent-hover active:bg-button-transparent-active [&>svg]:text-button-transparent-icon [&:hover>svg]:text-button-transparent-icon-hover [&:active>svg]:text-button-transparent-icon-active",
			},
			size: {
				xs: "h-6 w-6 rounded-md text-xs [&>svg]:h-[0.875rem] [&>svg]:w-[0.875rem]",
				sm: "h-8 w-8 rounded-md text-sm [&>svg]:h-4 [&>svg]:w-4",
				md: "h-10 w-10 rounded-md text-sm [&>svg]:h-5 [&>svg]:w-5",
				lg: "h-12 w-12 rounded-md text-md [&>svg]:h-5 [&>svg]:w-5",
				xl: "h-16 w-16 rounded-md text-lg [&>svg]:h-6 [&>svg]:w-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	}
);

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof iconButtonVariants> {
	asChild?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, variant, size, children, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";

		return (
			<Comp className={cn(iconButtonVariants({ variant, size, className }), size)} ref={ref} {...props}>
				{children}
			</Comp>
		);
	}
);

IconButton.displayName = "IconButton";