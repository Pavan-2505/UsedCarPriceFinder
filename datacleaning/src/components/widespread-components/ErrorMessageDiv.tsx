import { IoInformationCircleOutline } from "react-icons/io5";

const ErrorMessageDiv = ({ message, textSize, color = "#fb2c36", marginTop=true }: { message: string,marginTop? :boolean , textSize: number, color?: string }) => {
    return (
        <div className={`flex gap-1 font-light`} style={{ fontSize: `${textSize}px`, color: color }}>
            <div style={{marginTop : marginTop ? '4px' : '0px'}}>
                <IoInformationCircleOutline size={textSize} />
            </div>
            <p>{message}</p>
        </div>
    )
}

export default ErrorMessageDiv