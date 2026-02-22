// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import * as React from "react";

import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export type ButtonGroupProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, "asChild">;

const ButtonGroupContext = React.createContext<{
	variant: ButtonGroupProps["variant"];
	size: ButtonGroupProps["size"];
}>({
	variant: "default",
	size: "md",
});

const ButtonGroup = React.forwardRef<React.ElementRef<"div">, ButtonGroupProps>(
	({ children, className, variant, size, ...props }, ref) => {
		return (
			<ButtonGroupContext.Provider value={{ variant, size }}>
				<div
					ref={ref}
					className={cn(
						"inline-flex items-center justify-center rounded-button gap-[1px] flex-grow-0 [&>*:hover]:z-10 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
						variant === "outline" && "[&>*:not(:first-child)]:-ml-[2px]",
						className
					)}
				>
					{React.Children.map(children, (child) => {
						if (React.isValidElement(child)) {
							if (child.type === Button) {
								return React.cloneElement(child, {
									...props,
									variant,
									size,
									className: cn(
										(child.props as { className?: string }).className,
										variant === "outline" && "-ml-[2px]"
									),
								} as React.ComponentPropsWithoutRef<typeof Button>);
							}
						}

						return child;
					})}
				</div>
			</ButtonGroupContext.Provider>
		);
	}
);

ButtonGroup.displayName = "ButtonGroup";

const ButtonGroupItem = React.forwardRef<
	React.ElementRef<typeof Button>,
	Omit<React.ComponentPropsWithoutRef<typeof Button>, "variant" | "size">
>(({ children, className, ...props }, ref) => {
	const { variant, size } = React.useContext(ButtonGroupContext);

	return (
		<Button ref={ref} variant={variant} size={size} className={cn("rounded-button", className)} {...props}>
			{children ? children : <ChevronDown className="scale-[0.8]" />}
		</Button>
	);
});

ButtonGroupItem.displayName = "ButtonGroupItem";

export interface ButtonGroupLinkItemProps
	extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "variant" | "size" | "asChild"> {
	href: string;
}

const ButtonGroupLinkItem = React.forwardRef<React.ElementRef<typeof Button>, ButtonGroupLinkItemProps>(
	({ children, className, ...props }, ref) => {
		const { variant, size } = React.useContext(ButtonGroupContext);

		return (
			<Button asChild ref={ref} variant={variant} size={size} className={cn("rounded-button", className)} {...props}>
				<Link href={props.href}>{children ? children : <ChevronDown className="scale-[0.8]" />}</Link>
			</Button>
		);
	}
);

ButtonGroupLinkItem.displayName = "ButtonGroupLinkItem";

const ButtonGroupDisclosure = React.forwardRef<
	React.ElementRef<typeof Button>,
	Omit<React.ComponentPropsWithoutRef<typeof ButtonGroup>, "variant" | "size">
>(({ children, className, ...props }, ref) => {
	const { variant, size } = React.useContext(ButtonGroupContext);

	return (
		<Button ref={ref} variant={variant} size={size} className={cn("rounded-button px-0.5", className)} {...props}>
			{children ? children : <ChevronDown className="scale-[0.8]" />}
		</Button>
	);
});

ButtonGroupDisclosure.displayName = "ButtonGroupDisclosure";

export { ButtonGroup, ButtonGroupItem, ButtonGroupLinkItem, ButtonGroupDisclosure };
