export default function PipelineTag({tag}:{tag: string}) {
    return(
        <>
        <div className={`flex items-center justify-center ${tag === "traces" ? "bg-[#F59E0B]" : tag === "metrics" ? "bg-[#0AA8FF]" : "bg-[#5a9d51]" } text-white text-[12px] font-medium rounded-[5px] w-[48px] h-[23px] font-normal py-0.5`}>
            {tag}
        </div>
        </>
    )
}