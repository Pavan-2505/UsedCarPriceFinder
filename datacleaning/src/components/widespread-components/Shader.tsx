"use client";
const Shader = ({ isOpen ,zVal = 'z-11', transparency=50, updateEle}: { isOpen: boolean | number; zVal?: string; transparency?: number; updateEle?: (...args: any[]) => void }) : React.JSX.Element => {
    // console.log(`#d4d6df${transparency}`,transparency)
    return (
        <div onClick={updateEle ? () => updateEle() : undefined} style={{opacity : isOpen ? 100 : 0}} className={`w-full h-full fixed ${isOpen ? zVal : '-z-2'} bg-background2 dark:bg-darkgrey2 transition-all duration-100 ease-in-out `}/>
    )
}

export default Shader
