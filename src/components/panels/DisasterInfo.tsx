import disasterService from "@/services/disasterService";
import geoService from "@/services/geoService";
import { DisasterFeature, GeneralLocateResponse, GetNewsArticlesResponse } from "@/types/APITypes";
import { Balloon } from "@/types/generalTypes";
import { AxiosError } from "axios";
import { ExternalLink, Newspaper } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoonLoader } from "react-spinners";
import { Card } from "../ui/card";

import useDisasterNewsStats from "@/hooks/charts/useDisasterNewsStats";
import { getColor } from "@/lib/balloonUtils";
import { DisasterIcon, getDisasterTitle, getNearestBalloons } from "@/lib/disasterUtils";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    Title,
    Tooltip
} from 'chart.js';
import { Bar } from "react-chartjs-2";
import { IoBalloon, IoWarning } from "react-icons/io5";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

interface DisasterInfoProps {
    disaster?: DisasterFeature,
    disasterLocationMap: Map<string, GeneralLocateResponse>,
    setDisasterLocationMap: (disasterLocationMap: Map<string, GeneralLocateResponse>) => void;
    setFocusDisaster: (disaster?: DisasterFeature) => void;
    setFocusBalloon: (balloon?: Balloon & { id: number, offset: number }) => void;
    disasterNewsMap: Map<string, GetNewsArticlesResponse>,
    setDisasterNewsMap: (disasterNewsMap: Map<string, GetNewsArticlesResponse>) => void;
    balloons: (Balloon & { id: number, offset: number })[];
}

export default function DisasterInfo({ disaster, disasterLocationMap, setDisasterLocationMap, setFocusDisaster, setFocusBalloon, disasterNewsMap, setDisasterNewsMap, balloons }: DisasterInfoProps) {
    const [loading, setLoading] = useState(false);
    const [locationData, setLocationData] = useState<GeneralLocateResponse>();
    const [newsData, setNewsData] = useState<GetNewsArticlesResponse>();

    useEffect(() => {
        if (!disaster) {
            return;
        }

        const fetchLocation = async () => {
            if (!disaster) return;

            if (disasterLocationMap.has(JSON.stringify([disaster.geometry.y, disaster.geometry.x])) &&
                disasterLocationMap.get(JSON.stringify([disaster.geometry.y, disaster.geometry.x]))) {
                setLocationData(disasterLocationMap.get(JSON.stringify([disaster.geometry.y, disaster.geometry.x])));
                return
            } else {
                setLoading(true);

                const locationResponse = await geoService.getGeneralLocation(disaster.geometry.y, disaster.geometry.x);

                if (locationResponse instanceof AxiosError) {
                    setLocationData(undefined);
                } else {
                    if (locationResponse.isError) {
                        setLocationData(undefined);
                    } else {
                        setLocationData(locationResponse);
                        setDisasterLocationMap(disasterLocationMap.set(JSON.stringify([disaster.geometry.y, disaster.geometry.x]), locationResponse));
                    }
                }
            }
        }

        const fetchNews = async () => {
            if (!disaster) return;

            if (disasterNewsMap.has(JSON.stringify([disaster.attributes.eventtype, disaster.attributes.eventid]))) {
                setNewsData(disasterNewsMap.get(JSON.stringify([disaster.attributes.eventtype, disaster.attributes.eventid])));
            }

            const newsResponse = await disasterService.getNewsArticles(disaster);

            if (newsResponse instanceof AxiosError) {
                setNewsData(undefined);
            } else {
                if (newsResponse.isError || !newsResponse?.data) {
                    setNewsData(undefined);
                } else {
                    setNewsData(newsResponse.data);
                    setDisasterNewsMap(disasterNewsMap.set(JSON.stringify([disaster.attributes.eventtype, disaster.attributes.eventid]), newsResponse.data));
                }
            }
        }

        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchLocation(), fetchNews()])
            setLoading(false);
        }

        loadData();
    }, [disaster, disasterLocationMap, setDisasterLocationMap, disasterNewsMap, setDisasterNewsMap]);

    useEffect(() => {
        setNewsData(undefined)
    }, [disaster]);

    const { newsChartData, chartOptions } = useDisasterNewsStats(newsData);

    const closestBalloons = useMemo(() => getNearestBalloons(disaster, balloons), [disaster, balloons]);

    return (
        <Card
            className="fixed right-4 inset-y-8 w-auto min-w-[24rem] bg-background/90 backdrop-blur-md shadow-lg 
        transform transition-transform duration-300 ease-in-out z-[1000] overflow-y-auto"
            style={{
                transform: disaster ? 'translateX(0)' : 'translateX(calc(100% + 1rem))'
            }}>
            {disaster && (
                <div className="p-4 grid grid-rows-[auto_auto_auto_1fr] overflow-y-auto h-full">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 max-w-[16rem]">
                            <DisasterIcon disaster={disaster} />
                            <h2 className="text-lg font-bold whitespace-normal break-words leading-tight">{getDisasterTitle(disaster)}</h2>
                        </div>
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
                    <div>
                        {(loading || !locationData || !locationData.data) && (
                            <div className="flex items-center gap-2 mt-1">
                                {loading && (
                                    <MoonLoader className="text-primary" size={15} />
                                )}
                                <h2 className="text-muted-foreground text-sm">ID: {disaster.attributes.id}</h2>
                            </div>
                        )}
                    </div>
                    <div>
                        {(!loading && locationData && locationData.data) && (
                            <div className="flex flex-col mb-1">
                                <div className="flex items-center gap-2 max-w-[19.5rem]">
                                    <h2 className="text-sm text-primary whitespace-normal break-words leading-tight">
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
                                    <p className="text-sm text-muted-foreground self-end flex-grow whitespace-nowrap leading-tight">ID: {disaster.attributes.id}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-1 mt-1 overflow-y-auto">
                        <Link href={`https://www.google.com/maps/search/?api=1&query=${disaster.geometry.y},${disaster.geometry.x}`} target="_blank">
                            <div className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors">
                                <ExternalLink size={16} />
                                <p className="text-sm">({disaster.geometry.y.toFixed(4)}°, {disaster.geometry.x.toFixed(4)}°)</p>
                            </div>
                        </Link>
                        <div className="max-w-[23rem]">
                            <label className="text-muted-foreground text-xs">Raw Summary</label>
                            <p className="text-sm text-foreground whitespace-normal break-words leading-tight">{disaster.attributes.name}</p>
                            <p className="text-sm text-foreground whitespace-normal break-words leading-tight">{disaster.attributes.alertscore}</p>
                        </div>
                        <div className="grid grid-cols-2">
                            <div>
                                <label className="text-muted-foreground text-xs">Date Recorded</label>
                                <p className="text-sm text-foreground">{new Date(disaster.attributes.todate).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-muted-foreground text-xs">Duration</label>
                                <p className="text-sm text-foreground">~{Number.parseInt(disaster.attributes.durationinweek)} week(s)</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-xs">Nearby Balloons</label>
                            <div className="grid grid-cols-2 gap-2 mt-1 max-w-[23rem] mb-4">
                                {closestBalloons.slice(0, 4).map((balloon, index) => (
                                    <button
                                        key={`${JSON.stringify(balloon.position)}-${index}`}
                                        className="p-2 rounded-md bg-zinc-300/50 hover:bg-zinc-300/90 transition-all duration-300 shadow-sm grid grid-cols-[auto_1fr] gap-3 items-center text-left "
                                        onClick={() => {
                                            setFocusDisaster(undefined);
                                            setFocusBalloon(balloon);
                                        }}
                                    >
                                        <div className="w-8 h-8 bg-accent/75 rounded-md flex items-center justify-center">
                                            <IoBalloon size={20} className={`${getColor(balloon.altitude)}`} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <h3 className="text-xs text-foreground font-semibold">ID: {balloon.id}</h3>
                                            <p className="text-[0.7rem] leading-tight text-muted-foreground">
                                                {new Date(balloon.timestamp).toLocaleTimeString('default', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                            </p>
                                            <p className="text-[0.7rem] leading-tight text-muted-foreground">
                                                {balloon.position[0].toFixed(4)}°, {balloon.position[1].toFixed(4)}°
                                            </p>
                                            <p className="text-[0.7rem] leading-tight text-muted-foreground">
                                                Altitude: {balloon.altitude.toFixed(2)} km
                                            </p>
                                            <p className="text-[0.7rem] leading-tight text-muted-foreground">
                                                Displacement: {balloon.distance.toFixed(2)} km {balloon.direction}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex items-center gap-2 pt-2">
                                {loading && (
                                    <MoonLoader className="text-primary" size={15} />
                                )}
                                <h2 className="text-muted-foreground text-sm">Loading news...</h2>
                            </div>
                        ) : newsData && newsData.stats.dailyNews.length > 4 ? (
                            <div className="flex flex-col">
                                <div>
                                    <label className="text-muted-foreground text-xs">Relevant Articles</label>
                                    <div className="flex flex-col gap-2 max-w-[23rem]">
                                        {newsData.articles.sort((a, b) => new Date(b.pubdate).getTime() - new Date(a.pubdate).getTime()).slice(0, 3).map((article) => (
                                            <Link
                                                href={article.link}
                                                target="_blank"
                                                key={article.link}
                                                className="p-2 rounded-md bg-zinc-300/50 hover:bg-zinc-300/90 transition-all duration-300 shadow-sm grid grid-cols-[auto_1fr] gap-3 items-center"
                                            >
                                                <div className="w-12 h-12 bg-accent/75 rounded-md flex items-center justify-center">
                                                    <Newspaper size={24} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[0.7rem] text-muted-foreground">
                                                        {new Date(article.pubdate).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <h3 className="text-xs font-semibold leading-tight">{article.title}</h3>
                                                    <p className="text-[0.6rem] font-light text-muted-foreground">{article.source}</p>
                                                    <p className="text-[0.7rem] text-muted-foreground">
                                                        {article.description.length > 200 ? `${article.description.substring(0, 200)}...` : article.description}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="text-muted-foreground text-xs">News Stats</label>
                                    <div className={`max-w-[20rem]`}>
                                        <Bar data={newsChartData} options={chartOptions} />
                                    </div>
                                    <p className="text-[0.7rem] text-muted-foreground">
                                        Total Coverage: {newsData.stats.coverage.total}
                                    </p>
                                    <p className="text-[0.7rem] text-muted-foreground">
                                        Last Hour: {newsData.stats.coverage.lastHour}
                                    </p>
                                </div>
                            </div>
                        ) : newsData ? (
                            <div className="flex items-center gap-1.5">
                                <IoWarning className="text-muted-foreground" size={16} />
                                <p className="text-xs text-muted-foreground">
                                    Insignificant news coverage
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <IoWarning className="text-muted-foreground" size={16} />
                                <p className="text-xs text-muted-foreground">
                                    No news coverage found
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    )
}