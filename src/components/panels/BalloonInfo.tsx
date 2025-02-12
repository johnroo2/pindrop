import geoService from "@/services/geoService";
import { DisasterFeature, GeneralLocateResponse, GetWeatherResponse } from "@/types/APITypes";
import { Balloon } from "@/types/generalTypes";
import { AxiosError } from "axios";
import { CloudSunRainIcon, LandPlot, TrendingUpDownIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { MoonLoader } from "react-spinners";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tooltip as TooltipBase, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import BalloonOverview from "./subpanels/BalloonOverview";
import BalloonWeather from "./subpanels/BalloonWeather";
import BalloonForecast from "./subpanels/BalloonForecast";

interface BalloonInfoProps {
    balloon?: Balloon & { id: number, offset: number };
    focusBalloonVersions: (Balloon & { offset: number })[];
    disasters: DisasterFeature[];
    setFocusDisaster: (disaster?: DisasterFeature) => void;
    setFocusBalloon: Dispatch<SetStateAction<Balloon & { id: number, offset: number } | undefined>>;
    balloonLocationMap: Map<string, GeneralLocateResponse>;
    setBalloonLocationMap: (balloonLocationMap: Map<string, GeneralLocateResponse>) => void;
}

function usePreviousBalloon(balloon: Balloon & { id: number, offset: number } | undefined) {
    const previousBalloon = useRef<Balloon & { id: number, offset: number } | undefined>(undefined);

    useEffect(() => {
        previousBalloon.current = balloon;
    }, [balloon])

    return previousBalloon.current;
}

export default function BalloonInfo({ balloon, focusBalloonVersions, setFocusBalloon, setFocusDisaster, balloonLocationMap, setBalloonLocationMap, disasters }: BalloonInfoProps) {
    const [loading, setLoading] = useState(false);
    const [locationData, setLocationData] = useState<GeneralLocateResponse>();
    const [viewState, setViewState] = useState<"overview" | "weather" | "forecast">("overview");
    const [weatherMap, setWeatherMap] = useState<Map<string, GetWeatherResponse>>(new Map());
    const previousBalloon = usePreviousBalloon(balloon);

    useEffect(() => {
        if (JSON.stringify(previousBalloon) !== JSON.stringify(balloon)) {
            setViewState("overview");
        }
    }, [previousBalloon, balloon])

    useEffect(() => {
        if (!balloon) {
            return;
        }

        const fetchData = async () => {
            if (!balloon) return;

            if (balloonLocationMap.has(JSON.stringify([balloon.position[0], balloon.position[1]])) &&
                balloonLocationMap.get(JSON.stringify([balloon.position[0], balloon.position[1]]))) {
                setLocationData(balloonLocationMap.get(JSON.stringify([balloon.position[0], balloon.position[1]])));
                return
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

    return (
        <div className="fixed right-4 inset-y-8 pointer-events-none z-[1000] flex items-start gap-4 justify-end 
        overflow-y-auto transform transition-transform duration-300 ease-in-out"
            style={{
                transform: balloon ? 'translateX(0)' : 'translateX(calc(100% + 1rem))'
            }}>
            <div className="flex flex-col gap-4 mt-4">
                {loading ? (
                    <>
                        <Button
                            className="z-[1000] pointer-events-auto bg-background/90 backdrop-blur-md shadow-lg"
                            variant="outline"
                            size="icon"
                        >
                            <MoonLoader size={15} />
                        </Button>
                        <Button
                            className="z-[1000] pointer-events-auto bg-background/90 backdrop-blur-md shadow-lg"
                            variant="outline"
                            size="icon"
                        >
                            <MoonLoader size={15} />
                        </Button>
                    </>
                ) : locationData?.dataType === "geo" || locationData?.dataType === "marine" ? (
                    <>
                        <TooltipProvider delayDuration={0}>
                            <TooltipBase>
                                <TooltipTrigger asChild>
                                    <div className="z-[1000] pointer-events-auto ">
                                        <Button
                                            className={`${viewState !== "weather" && "bg-background/90"} backdrop-blur-md shadow-lg`}
                                            variant={viewState === "weather" ? "default" : "outline"}
                                            disabled={locationData?.dataType === "marine"}
                                            size="icon"
                                            onClick={() => setViewState("weather")}
                                        >
                                            <CloudSunRainIcon size={24} />
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[1000]">
                                    {locationData?.dataType === "marine" ? "Land Required" : "Weather"}
                                </TooltipContent>
                            </TooltipBase>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={0}>
                            <TooltipBase>
                                <TooltipTrigger asChild>
                                    <div className="z-[1000] pointer-events-auto ">
                                        <Button
                                            className={`${viewState !== "forecast" && "bg-background/90"} backdrop-blur-md shadow-lg`}
                                            variant={viewState === "forecast" ? "default" : "outline"}
                                            disabled={locationData?.dataType === "marine"}
                                            size="icon"
                                            onClick={() => setViewState("forecast")}
                                        >
                                            <TrendingUpDownIcon size={24} />
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="z-[1000]">
                                    {locationData?.dataType === "marine" ? "Land Required" : "Forecast"}
                                </TooltipContent>
                            </TooltipBase>
                        </TooltipProvider>
                    </>
                ) : (
                    <></>
                )}
                <TooltipProvider delayDuration={0}>
                    <TooltipBase>
                        <TooltipTrigger asChild>
                            <Button
                                className="z-[1000] pointer-events-auto bg-background/90 backdrop-blur-md shadow-lg"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setFocusBalloon((prev: Balloon & { id: number, offset: number } | undefined) => prev ? { ...prev } : prev)
                                }}
                            >
                                <LandPlot size={24} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="z-[1000]">
                            Re-center
                        </TooltipContent>
                    </TooltipBase>
                </TooltipProvider>
            </div>
            <Card className={`bg-background/90 backdrop-blur-md overflow-x-hidden 
            shadow-lg overflow-y-auto pointer-events-auto h-full transition-all
            ${viewState === "weather" || viewState === "forecast" ? "w-[30rem]" : "w-[20rem]"}`}>
                {(() => {
                    switch (viewState) {
                        case "overview":
                            return <BalloonOverview
                                loading={loading}
                                locationData={locationData}
                                balloon={balloon}
                                focusBalloonVersions={focusBalloonVersions}
                                setFocusBalloon={setFocusBalloon}
                                setFocusDisaster={setFocusDisaster}
                                disasters={disasters}
                            />
                        case "weather":
                            return <BalloonWeather
                                balloon={balloon}
                                locationData={locationData}
                                setViewState={setViewState}
                                weatherMap={weatherMap}
                                setWeatherMap={setWeatherMap}
                            />
                        case "forecast":
                            return <BalloonForecast
                                balloon={balloon}
                                locationData={locationData}
                                setViewState={setViewState}
                                weatherMap={weatherMap}
                                setWeatherMap={setWeatherMap}
                            />
                        default:
                            return <></>
                    }
                })()}
            </Card>
        </div>
    );
}
