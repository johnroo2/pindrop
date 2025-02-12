import { getColor } from "@/lib/disasterUtils";
import { DisasterFeature } from "@/types/APITypes";
import { ShieldAlert } from "lucide-react";

export interface DisasterIconProps {
    disaster: DisasterFeature;
    noHighlight: boolean;
}

export default function DisasterIcon({ disaster, noHighlight }: DisasterIconProps) {
    return (
        <ShieldAlert size={20} className={`${noHighlight ? 'text-opacity-50 hover:text-opacity-90' :
            'text-opacity-80 hover:text-opacity-100'}
        ${getColor(Number.parseInt(disaster.attributes.alertscore))} z-[100]`} />
    );
}