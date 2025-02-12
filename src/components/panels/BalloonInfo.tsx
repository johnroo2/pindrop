import { getExtrapolatedVelocityString, getNearestDisasters } from "@/lib/balloonUtils";
import { DisasterIcon, getDisasterTitle } from "@/lib/disasterUtils";
import geoService from "@/services/geoService";
import { DisasterFeature, GeneralLocateResponse } from "@/types/APITypes";
import { Balloon } from "@/types/generalTypes";
import { AxiosError } from "axios";
import {
    CategoryScale,
    ChartData,
    Chart as ChartJS,
    ChartOptions,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Line } from 'react-chartjs-2';
import { IoBalloon } from "react-icons/io5";
import { MoonLoader } from "react-spinners";
import { Card } from "../ui/card";

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

interface BalloonInfoProps {
    balloon?: Balloon & { id: number, offset: number };
    focusBalloonVersions: (Balloon & { offset: number })[];
    disasters: DisasterFeature[];
    setFocusDisaster: (disaster?: DisasterFeature) => void;
    setFocusBalloon: (balloon?: Balloon & { id: number, offset: number }) => void;
    balloonLocationMap: Map<string, GeneralLocateResponse>;
    setBalloonLocationMap: (balloonLocationMap: Map<string, GeneralLocateResponse>) => void;
}

export default function BalloonInfo({ balloon, focusBalloonVersions, setFocusBalloon, setFocusDisaster, balloonLocationMap, setBalloonLocationMap, disasters }: BalloonInfoProps) {
    const [loading, setLoading] = useState(false);
    const [locationData, setLocationData] = useState<GeneralLocateResponse>();

    useEffect(() => {
        if (!balloon) {
            return;
        }

        const fetchData = async () => {
            if (!balloon) return;

            if (balloonLocationMap.has(JSON.stringify([balloon.position[0], balloon.position[1]])) && balloonLocationMap.get(JSON.stringify([balloon.position[0], balloon.position[1]]))) {
                setLocationData(balloonLocationMap.get(JSON.stringify([balloon.position[0], balloon.position[1]])));
            } else {
                setLoading(true);

                const locationResponse = await geoService.getGeneralLocation(balloon.position[0], balloon.position[1]);

                if (locationResponse instanceof AxiosError) {
                    setLocationData(undefined);
                } else {
                    if (locationResponse.isError) {
                        setLocationData(undefined);
                    } else {
                        setLocationData(locationResponse);
                        setBalloonLocationMap(balloonLocationMap.set(JSON.stringify([balloon.position[0], balloon.position[1]]), locationResponse));
                    }
                }

                setLoading(false);
            }
        }

        fetchData();
    }, [balloon, balloonLocationMap, setBalloonLocationMap]);

    useEffect(() => {
        setLocationData(undefined)
    }, [balloon]);

    const altitudeSetup = useMemo(() => {
        if (!balloon || focusBalloonVersions.length === 0) return { labels: [], datasets: [] };

        const labels = Array.from({ length: 24 }, (_, i) => 23 - i);
        const data = new Array(24).fill(null);

        focusBalloonVersions.forEach(version => {
            data[23 - version.offset] = version.altitude;
        });

        data[23 - balloon.offset] = balloon.altitude;

        let lastKnownValue = null;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === null) {
                let prevIndex = i - 1;
                let nextIndex = i + 1;

                while (prevIndex >= 0 && data[prevIndex] === null) {
                    prevIndex--;
                }

                while (nextIndex < data.length && data[nextIndex] === null) {
                    nextIndex++;
                }

                if (prevIndex >= 0 && nextIndex < data.length) {
                    const prevValue = data[prevIndex];
                    const nextValue = data[nextIndex];
                    const offsetDiff = nextIndex - prevIndex;
                    const valueDiff = nextValue - prevValue;
                    const step = valueDiff / offsetDiff;
                    data[i] = prevValue + step * (i - prevIndex);
                } else if (prevIndex >= 0) {
                    data[i] = data[prevIndex];
                } else if (nextIndex < data.length) {
                    data[i] = data[nextIndex];
                } else if (lastKnownValue !== null) {
                    data[i] = lastKnownValue;
                }
            } else {
                lastKnownValue = data[i];
            }
        }

        for (let i = 1; i < data.length; i++) {
            if (data[i] !== null && data[i - 1] !== null) {
                const diff = Math.abs(data[i] - data[i - 1]);
                if (diff > 5) {
                    data[i] = data[i - 1] + Math.sign(data[i] - data[i - 1]) * 5;
                }
            }
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Altitude',
                    data,
                    fill: true,
                    backgroundColor: 'rgba(20, 10, 0, 0.2)',
                    borderColor: 'rgba(20, 10, 0, 0.4)',
                    borderWidth: 1,
                    pointRadius: data.map((_, index) => index === (23 - balloon.offset) ? 4 : 2),
                    pointBackgroundColor: 'rgba(20, 10, 0, 0.8)',
                    tension: 0.25,
                },
            ],
        };
    }, [balloon, focusBalloonVersions]);

    const chartOptions: ChartOptions<'line'> = useMemo(() => {
        if (focusBalloonVersions.length === 0) return {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            }
        };

        return {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            const value = Number.parseInt(context[0].label);
                            return value === 0 ? 'Present' : `-${value}h`;
                        },
                        label: function (context) {
                            const value = context.raw as number;
                            return `${value.toFixed(2)} km`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
                x: {
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        display: false,
                        maxTicksLimit: 8,
                    }
                }
            }
        }
    }, [focusBalloonVersions]);

    const extrapolatedVelocity = useMemo(() => getExtrapolatedVelocityString(balloon, focusBalloonVersions), [balloon, focusBalloonVersions]);

    const closestDisasters = useMemo(() => getNearestDisasters(balloon, disasters), [balloon, disasters])

    return (
        <Card
            className="fixed right-4 inset-y-8 w-auto min-w-[20rem] bg-background/90 backdrop-blur-md shadow-lg 
            transform transition-transform duration-300 ease-in-out z-[1000] overflow-y-auto"
            style={{
                transform: balloon ? 'translateX(0)' : 'translateX(calc(100% + 1rem))'
            }}>
            {balloon && (
                <div className="p-4 h-full overflow-y-auto grid grid-rows-[auto_1fr]">
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
                            className="text-gray-500 hover:text-gray-700 text-lg"
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
                            <div className="max-w-[20rem]">
                                <Line data={altitudeSetup as ChartData<'line'>}
                                    options={chartOptions} />
                            </div>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-xs">Nearby Disasters</label>
                            <div className="flex flex-col gap-2 mt-1 max-w-[20rem]">
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
            )}
        </Card>
    );
}
