const calculateColor = (index: number): string => {
    switch (index) {
      case 0:
        return '#F59E0B';
      case 1:
        return '#0AA8FF';
      case 2:
        return '#40ad54';
      case 3:
        return '#911dc9';
    }
    return '#FFC542';
  };

  export default function PipelineTag({findIndex, tag}:{findIndex: number, tag: string}) {
    const tagColor = {
      backgroundColor: calculateColor(findIndex),
      color: "#fff",
      fontSize: "12px",
      fontWeight: 500,
      borderRadius:'5px',
      width: 'fit-content',
      padding: '2px 5px',
    }
    return(
        <>
        <div style={tagColor}>
            {tag}
        </div>
        </>
    )
}