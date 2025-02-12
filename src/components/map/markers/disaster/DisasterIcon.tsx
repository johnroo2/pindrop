import { DisasterFeature } from "@/types/APITypes";
import { ShieldAlert } from "lucide-react";

export interface DisasterIconProps {
    disaster: DisasterFeature;
    noHighlight: boolean;
}

export default function DisasterIcon({ noHighlight }: DisasterIconProps) {
    return (
        <ShieldAlert size={20} className={`${noHighlight ? 'text-opacity-30 hover:text-opacity-80' :
            'text-opacity-80 hover:text-opacity-100'}
             text-red-500 z-[100]`} />
    );
}