import { MoonLoader } from "react-spinners";
import { Skeleton } from "../ui/skeleton";

interface MapLoaderProps {
    progress: number;
}

export default function MapLoader({ progress }: MapLoaderProps) {
    const maxProgress = 18; //make it lower so it looks faster
    const progressPercentage = (Math.min(progress, maxProgress) / maxProgress) * 100;

    return (
        <div className="relative w-full h-full grid grid-rows-[1fr_auto] p-4 gap-4">
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                <MoonLoader />
                <p className="text-xl font-medium text-primary mt-4">Fetching Balloons...</p>
                <div className="max-w-3/4 w-[200px] bg-gray-300 rounded-full h-1.5 mt-4">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-500 ease-in-out"
                        style={{
                            width: `${progressPercentage}%`,
                            backgroundImage: 'repeating-linear-gradient(45deg, #71717a 0, #71717a 10px, #52525b 10px, #52525b 20px)'
                        }}
                    ></div>
                </div>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4">
                <div className="grid grid-rows-[auto_1fr] gap-4">
                    <div className="col-start-1">
                        <Skeleton className="w-64 h-10 rounded-md" />
                    </div>

                    <Skeleton className="w-full h-full" />
                </div>
                <div className="col-start-3 row-start-1 flex flex-col gap-2">
                    <Skeleton className="w-10 h-10 rounded-md" />
                    <Skeleton className="w-10 h-10 rounded-md" />
                    <Skeleton className="w-10 h-24 rounded-md" />
                </div>
            </div>
            <div className="flex flex-row justify-between items-end">
                <div className="col-start-1 row-start-3">
                    <Skeleton className="w-32 h-2" />
                    <div className="flex gap-1 mt-1">
                        <Skeleton className="w-8 h-4" />
                        <Skeleton className="w-8 h-4" />
                        <Skeleton className="w-8 h-4" />
                    </div>
                </div>

                {/* Attribution */}
                <div className="col-start-3 row-start-3">
                    <Skeleton className="w-48 h-4" />
                </div>
            </div>
        </div>
    );
}