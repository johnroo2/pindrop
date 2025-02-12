import { ChevronDownCircle } from "lucide-react";
import { useState } from "react";
import { IoBalloon } from "react-icons/io5";
import { Card } from "../ui/card";

export default function MapLegend() {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <Card className={`z-[1000] absolute bottom-4 left-4 flex flex-col transition-all 
        duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-[calc(100%-32px+1rem)]'} 
        bg-background/90 shadow-lg backdrop-blur-md`}>
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="flex items-center justify-center gap-2 h-[32px]"
            >
                <span className="text-xs">Legend</span>
                <ChevronDownCircle
                    size={14}
                    className={`transition-transform duration-300 ${isVisible ? 'rotate-0' : 'rotate-180'}`}
                />
            </button>
            <div className="px-5 pb-4">
                <p className="text-sm font-medium mb-2">Balloon Altitude</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="text-sky-400"><IoBalloon size={16} /></div>
                        <span className="text-xs">Above 20km</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-emerald-400"><IoBalloon size={16} /></div>
                        <span className="text-xs">15-20km</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-green-400"><IoBalloon size={16} /></div>
                        <span className="text-xs">10-15km</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-lime-400"><IoBalloon size={16} /></div>
                        <span className="text-xs">5-10km</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-yellow-400"><IoBalloon size={16} /></div>
                        <span className="text-xs">Below 5km</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}