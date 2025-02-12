import { getColor } from "@/lib/balloonUtils";
import { IoBalloon } from "react-icons/io5";

interface BalloonIconProps {
    altitude: number;
    size: number;
    noHighlight: boolean;
    noFocus: boolean;
}

export default function BalloonIcon({ altitude, size, noHighlight, noFocus }: BalloonIconProps) {
    return (
        <IoBalloon
            size={size}
            className={`${getColor(altitude)} 
                ${noHighlight ? 'text-opacity-30 hover:text-opacity-80 ' :
                    noFocus ? 'text-opacity-60 hover:text-opacity-90' :
                        'text-opacity-80 hover:text-opacity-100 '}
                hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] 
                hover:scale-[1.2] transition-all duration-300`}
        />
    );
};