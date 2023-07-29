export default function NodTag({tag}:{tag: string}) {
    return(
        <>
        <div className={`flex items-center justify-center ${tag === "Receiver" || tag ===  "Exporter" ? "bg-[#5563E9]" : "bg-[#E9BA52]"} text-white text-[8px] rounded-[55px] w-14 font-normal py-0.5`}>
            {tag}
        </div>
        </>
    )
}