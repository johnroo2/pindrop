import { getExtrapolatedVelocityString, getNearestDisasters } from "@/lib/balloonUtils";
import { DisasterIcon, getDisasterTitle } from "@/lib/disasterUtils";
import { DisasterFeature, GeneralLocateResponse } from "@/types/APITypes";
import { Balloon } from "@/types/generalTypes";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { IoBalloon } from "react-icons/io5";
import { MoonLoader } from "react-spinners";

import {
    CategoryScale,
    ChartData,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { Line } from "react-chartjs-2";
import useBalloonAltitude from "@/hooks/charts/useBalloonAltitude";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

interface BalloonOverviewProps {
    loading: boolean;
    locationData: GeneralLocateResponse | undefined;
    balloon?: Balloon & { id: number, offset: number };
    focusBalloonVersions: (Balloon & { offset: number })[];
    setFocusBalloon: (balloon: Balloon & { id: number, offset: number } | undefined) => void;
    setFocusDisaster: (disaster: DisasterFeature | undefined) => void;
    disasters: DisasterFeature[];
}

export default function BalloonOverview({ balloon, focusBalloonVersions, setFocusBalloon, setFocusDisaster, loading, locationData, disasters }: BalloonOverviewProps) {
    const { altitudeSetup, chartOptions } = useBalloonAltitude(balloon, focusBalloonVersions);

    const extrapolatedVelocity = useMemo(() => getExtrapolatedVelocityString(balloon, focusBalloonVersions), [balloon, focusBalloonVersions]);

    const closestDisasters = useMemo(() => getNearestDisasters(balloon, disasters), [balloon, disasters])

    if (!balloon) return <></>;

    return (
        <div className="p-4 h-full overflow-y-auto grid grid-rows-[auto_1fr] w-[20rem] overflow-x-hidden">
            <div className="flex justify-between items-center">
                {(loading || !locationData || !locationData.data) && (
                    <div className="flex items-center gap-2">
                        {loading && (
                            <MoonLoader className="text-primary" size={15} />
                        )}
                        <h2 className="text-muted-foreground text-sm">ID: {balloon?.id}</h2>
                    </div>
                )}
                {(!loading && locationData && locationData.data) && (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 max-w-[16.5rem]">
                            <IoBalloon size={20} className="min-w-[20px]" />
                            <h2 className="text-lg font-semibold whitespace-normal break-words leading-tight">
                                {locationData.dataType === "geo" ? (
                                    <div>
                                        {locationData.data.address?.state ? `${locationData.data.address?.state}, ` : ""}{locationData.data.address.country}
                                    </div>
                                ) : (
                                    <div>
                                        {locationData.data.preferredGazetteerName}
                                    </div>
                                )}
                            </h2>
                            <p className="text-sm text-muted-foreground self-end flex-grow whitespace-nowrap">ID: {balloon?.id}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        setFocusBalloon(undefined);
                        setFocusDisaster(undefined);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-lg self-start"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-1 mt-1 h-full overflow-y-auto">
                <Link href={`https://www.google.com/maps/search/?api=1&query=${balloon.position[0]},${balloon.position[1]}`} target="_blank">
                    <div className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors">
                        <ExternalLink size={16} />
                        <p className="text-sm">({balloon.position[0].toFixed(4)}°, {balloon.position[1].toFixed(4)}°)</p>
                    </div>
                </Link>
                <div>
                    <label className="text-muted-foreground text-xs">Available Data</label>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="flex flex-row gap-1">
                            {Array.from({ length: 12 }, (_, index) => (
                                <div key={index} className={`${index === balloon.offset && 'border-2 border-primary'} w-3 h-3 rounded-full 
                                        ${focusBalloonVersions.some(version => version.offset === index) ?
                                        'bg-green-500' : 'bg-gray-500'}`}>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-row gap-1">
                            {Array.from({ length: 12 }, (_, index) => (
                                <div key={index + 12} className={`${index + 12 === balloon.offset && 'border-2 border-primary'} w-3 h-3 rounded-full 
                                        ${focusBalloonVersions.some(version => version.offset === index + 12) ?
                                        'bg-green-500' : 'bg-gray-500'}`}>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-muted-foreground text-xs">Date Fetched</label>
                    <p className="text-sm text-foreground">{new Date(balloon.timestamp).toLocaleString()}</p>
                </div>
                <div>
                    <label className="text-muted-foreground text-xs">Computed Velocity</label>
                    <p className="text-sm text-foreground">{extrapolatedVelocity}</p>
                </div>
                <div>
                    <label className="text-muted-foreground text-xs">Altitude (km)</label>
                    <div className="max-w-[19rem]">
                        <Line data={altitudeSetup as ChartData<'line'>}
                            options={chartOptions} />
                    </div>
                </div>
                <div>
                    <label className="text-muted-foreground text-xs">Nearby Disasters</label>
                    <div className="flex flex-col gap-2 mt-1 max-w-[19rem]">
                        {closestDisasters.slice(0, 3).map((disaster) => (
                            <button
                                key={disaster.attributes.id}
                                className="p-2 rounded-md bg-zinc-300/50 hover:bg-zinc-300/90 transition-all duration-300 shadow-sm grid grid-cols-[auto_1fr] gap-3 items-center "
                                onClick={() => {
                                    setFocusDisaster(disaster);
                                    setFocusBalloon(undefined);
                                }}
                            >
                                <div className="w-8 h-8 bg-accent/75 rounded-md flex items-center justify-center">
                                    <DisasterIcon disaster={disaster} />
                                </div>
                                <div className="flex flex-col items-start">
                                    <h3 className="text-sm text-foreground font-semibold">{getDisasterTitle(disaster)}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        ID: {disaster.attributes.eventid}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(disaster.attributes.todate).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Displacement: {disaster.distance.toFixed(2)} km {disaster.direction}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}