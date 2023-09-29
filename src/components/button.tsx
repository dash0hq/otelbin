// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { type ComponentProps } from "react";

import { cn } from "~/lib/utils";

import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";

export const buttonVariants = cva(
	"group/button inline-flex border items-center shrink-0 justify-center rounded-button text-sm font-medium ring-offset-background transition-colors [&>svg]:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			// TODO remove unused
			variant: {
				default:
					"bg-button text-button hover:text-button-hover active:text-button-active border-button hover:bg-button-hover active:bg-button-active disabled:opacity-50 shadow-sm [&>svg]:text-button-icon [&:hover>svg]:text-button-icon-hover [&:active>svg]:text-button-icon-active data-[state=open]:bg-button-hover data-[state=open]:text-button-hover [&[data-state=open]>svg]:text-button-icon-hover",
				destructive:
					"bg-button-destructive text-button-destructive border-button-destructive hover:bg-button-destructive-hover active:bg-button-destructive-active shadow-sm [&>svg]:text-button-destructive-icon [&:hover>svg]:text-button-destructive-icon-hover [&:active>svg]:text-button-destructive-icon-active data-[state=open]:bg-button-destructive-hover data-[state=open]:text-button-destructive-hover [&[data-state=open]>svg]:text-button-destructive-icon-hover",
				outline:
					"border-button-outline text-button-outline hover:border-button-outline-hover active:border-butotn-outline-active hover:text-button-outline-hover active:text-button-outline-active [&>svg]:text-button-outline-icon [&:hover>svg]:text-button-outline-icon-hover [&:active>svg]:text-button-outline-icon-active data-[state=open]:bg-button-outline-hover data-[state=open]:border-button-outline-hover data-[state=open]:text-button-outline-hover [&[data-state=open]>svg]:text-button-outline-icon-hover",
				cta: "bg-button-cta text-button-cta border-button-cta hover:bg-button-cta-hover active:bg-button-cta-active shadow-sm [&>svg]:text-button-cta-icon [&:hover>svg]:text-button-cta-icon-hover [&:active>svg]:text-button-cta-icon-active data-[state=open]:bg-button-cta-hover data-[state=open]:text-button-cta-hover [&[data-state=open]>svg]:text-button-cta-icon-hover",
				transparent:
					"bg-button-transparent text-button-transparent hover:text-button-hover active:text-button-active border-button hover:bg-button-hover active:bg-button-active disabled:opacity-50 [&>svg]:text-button-icon [&:hover>svg]:text-button-icon-hover [&:active>svg]:text-button-icon-active data-[state=open]:bg-button-transparent-hover data-[state=open]:text-button-transparent-hover [&[data-state=open]>svg]:text-button-transparent-icon-hover",
			},
			// TODO remove unused
			size: {
				xs: "h-6 gap-[0.375rem] px-2 text-xs [&>svg]:h-[0.875rem] [&>svg]:w-[0.875rem]",
				sm: "h-8 gap-[0.375rem] px-3 text-sm [&>svg]:h-4 [&>svg]:w-4",
				md: "h-10 gap-2 px-3 text-sm [&>svg]:h-5 [&>svg]:w-5",
				lg: "h-12 gap-3 px-4 text-md [&>svg]:h-5 [&>svg]:w-5",
				xl: "h-16 gap-3 px-5 text-lg [&>svg]:h-6 [&>svg]:w-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, children, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp className={cn(buttonVariants({ variant, size }), size, className)} ref={ref} {...props}>
				{children}
			</Comp>
		);
	}
);

Button.displayName = "Button";

const buttonIconVariants = cva("", {
	variants: {
		position: {
			start: "-ml-1",
			end: "-mr-1",
		},
		disclosure: {
			true: "scale-[0.8]",
		},
	},
});

export interface ButtonIconProps
	extends React.ButtonHTMLAttributes<HTMLElement>,
		VariantProps<typeof buttonIconVariants> {}

const ButtonIcon = React.forwardRef<HTMLElement, ButtonIconProps>(
	({ className, disclosure, position = "start", children, ...props }, ref) => {
		const Comp = Slot;

		return (
			<Comp className={cn(buttonIconVariants({ position, className, disclosure }))} ref={ref} {...props}>
				{children}
			</Comp>
		);
	}
);

ButtonIcon.displayName = "ButtonIcon";

export const ButtonIconStart = (props: Omit<ComponentProps<typeof ButtonIcon>, "position" | "disclosure">) => (
	<ButtonIcon position="start" {...props} />
);
export const ButtonIconEnd = (props: Omit<ComponentProps<typeof ButtonIcon>, "position" | "disclosure">) => (
	<ButtonIcon position="end" {...props} />
);
export const ButtonIconDisclosure = (
	props: Omit<ComponentProps<typeof ButtonIcon>, "children" | "position" | "disclosure">
) => (
	<ButtonIcon position="end" disclosure {...props}>
		<ChevronDownIcon />
	</ButtonIcon>
);

export interface ButtonLinkItemProps extends Omit<ButtonProps, "type"> {
	href: string;
}

export const ButtonLink = ({ href, children, ...props }: ButtonLinkItemProps) => (
	<Button {...props} asChild>
		<Link href={href}>{children}</Link>
	</Button>
);
ButtonLink.displayName = "ButtonLink";
