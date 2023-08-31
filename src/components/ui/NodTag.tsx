export default function NodTag({ tag }: { tag: string }) {
	return (
		<>
			<div
				className={`flex items-center justify-center ${
					tag === "Receiver" || tag === "Exporter" ? "bg-[#5563E9]" : "bg-[#E9BA52]"
				} w-14 rounded-[55px] py-0.5 text-[8px] font-normal text-white`}
			>
				{tag}
			</div>
		</>
	);
}
