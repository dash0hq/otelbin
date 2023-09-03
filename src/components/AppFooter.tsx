import Dash0 from "~/components/assets/svg/dash0.svg";

export function AppFooter() {
	return (
		<div className="flex shrink-0 items-center justify-between border-t-1 border-subtle bg-neutral-150 px-4 py-2">
			{/* unused left-side */}
			<div />
			<a
				href="https://www.dash0.com/?utm_source=otelbin&utm_medium=footer&utm_campaign=otelbin"
				target="_blank"
				className="flex whitespace-nowrap text-xs font-normal text-default"
			>
				Crafted by
				<Dash0 fill="#6D737D" width="55px" className="ml-2" />
			</a>
		</div>
	);
}
