import weatherService from "@/services/weatherService";
import { GeneralLocateResponse, GetWeatherResponse } from "@/types/APITypes";
import { Balloon } from "@/types/generalTypes";
import { AxiosError } from "axios";
import { ArrowLeft, CloudRain, ExternalLink, Snowflake, Wind } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IoWarning } from "react-icons/io5";
import { MoonLoader } from "react-spinners";

interface BalloonWeatherProps {
    balloon?: Balloon & { id: number, offset: number };
    locationData?: GeneralLocateResponse;
    setViewState: (viewState: "overview" | "weather" | "forecast") => void;
    weatherMap: Map<string, GetWeatherResponse>;
    setWeatherMap: (weatherMap: Map<string, GetWeatherResponse>) => void;
}

export default function BalloonWeather({ balloon, locationData, setViewState, weatherMap, setWeatherMap }: BalloonWeatherProps) {
    const [loading, setLoading] = useState(false);
    const [weatherData, setWeatherData] = useState<GetWeatherResponse>();

    useEffect(() => {
        if (!balloon || !locationData || locationData.dataType === "none" || locationData.dataType === "marine") {
            setViewState("overview");
            return;
        }

        const fetchData = async () => {
            if (weatherMap.has(JSON.stringify([balloon.position[0], balloon.position[1]])) &&
                !weatherMap.get(JSON.stringify([balloon.position[0], balloon.position[1]]))?.isError) {
                setWeatherData(weatherMap.get(JSON.stringify([balloon.position[0], balloon.position[1]])));
                return;
            }

            setLoading(true);

            setWeatherData(undefined);

            const res = await weatherService.getWeatherData(balloon.position[0], balloon.position[1]);

            if (res instanceof AxiosError) {
                setViewState("overview");
                setWeatherData(undefined);
            } else {
                setWeatherMap(new Map(weatherMap).set(JSON.stringify([balloon.position[0], balloon.position[1]]), res));
                setWeatherData(res);
            }

            setLoading(false);
        }

        fetchData();
    }, [balloon, locationData, setViewState, weatherMap, setWeatherMap])

    const getManualAirQualityColor = (index: number): string => {
        switch (index) {
            case 1: return 'bg-green-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-orange-500';
            case 4: return 'bg-red-500';
            case 5: return 'bg-purple-500';
            case 6: return 'bg-maroon-500';
            default: return 'bg-gray-500';
        }
    };

    const getManualAirQualityRisk = (index: number): string => {
        switch (index) {
            case 1: return 'Good';
            case 2: return 'Moderate';
            case 3: return 'Unhealthy for Sensitive Groups';
            case 4: return 'Unhealthy';
            case 5: return 'Very Unhealthy';
            case 6: return 'Hazardous';
            default: return 'Unknown';
        }
    };

    const history = useMemo(() => {
        if (!weatherData || weatherData.isError || !weatherData.history || !weatherData.current) {
            return [];
        }

        const timezone = weatherData.current.location.tz_id;

        const forecastDays = weatherData.history.forecast.forecastday
            .filter((day) => {
                const localTime = new Date(day.date_epoch * 1000).toLocaleString("en-US", { timeZone: timezone });
                const localTimeEpoch = new Date(localTime).getTime() / 1000;
                if (localTimeEpoch < (weatherData?.current?.current.last_updated_epoch as number)) {
                    return true;
                }
                return false;
            })
            .sort((a, b) =>
                b.date_epoch - a.date_epoch
            );

        return forecastDays.slice(0, 6);
    }, [weatherData])

    if (!balloon || !locationData || locationData.dataType === "none" || locationData.dataType === "marine") {
        return <></>;
    }

    return (
        <div className="p-4 h-full overflow-y-auto grid grid-rows-[auto_1fr] w-[30rem] overflow-x-hidden">
            <div className="flex flex-row gap-2 items-center pb-2">
                <button
                    onClick={() => {
                        setViewState("overview");
                    }}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4 max-w-[28rem]">
                    {!(locationData && locationData.data) && (
                        <div className="flex items-center gap-2">
                            {loading && (
                                <MoonLoader className="text-primary" size={15} />
                            )}
                            <h2 className="text-muted-foreground text-sm">ID: {balloon?.id}</h2>
                        </div>
                    )}
                    {(locationData && locationData.data) && (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-4 max-w-[28rem]">
                                <h2 className="text-lg font-semibold whitespace-normal break-words leading-tight">
                                    <div>
                                        {locationData.data.address?.state ? `${locationData.data.address?.state}, ` : ""}{locationData.data.address.country}
                                    </div>
                                </h2>
                                <p className="text-sm text-muted-foreground self-end flex-grow whitespace-nowrap">ID: {balloon?.id}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Current & Historical Weather
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-2 mt-1 overflow-y-auto">
                <Link href={`https://www.google.com/maps/search/?api=1&query=${balloon.position[0]},${balloon.position[1]}`} target="_blank">
                    <div className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors">
                        <ExternalLink size={16} />
                        <p className="text-sm">({balloon.position[0].toFixed(4)}°, {balloon.position[1].toFixed(4)}°)</p>
                    </div>
                </Link>
                {loading ? (
                    <div className="flex items-center gap-2 pt-2 h-fit">
                        {loading && (
                            <MoonLoader className="text-primary" size={15} />
                        )}
                        <h2 className="text-muted-foreground text-sm">Loading weather...</h2>
                    </div>
                ) : (weatherData && !weatherData.isError) ? (
                    <>
                        <div className="flex flex-col mt-4">
                            {weatherData.current &&
                                <div className="grid grid-cols-[auto_1fr] gap-4 bg-zinc-300/50 p-4 rounded-md items-center">
                                    <div className="rounded-full w-12 h-12 bg-zinc-50/75 flex 
                        items-center justify-center overflow-hidden border border-zinc-50/90">
                                        <Image
                                            src={`https:${weatherData.current.current.condition.icon}`}
                                            alt={weatherData.current.current.condition.text}
                                            width={36}
                                            height={36}
                                        />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <p className="text-sm font-medium">{weatherData.current.current.condition.text}</p>
                                        <div className="grid grid-cols-2">
                                            <p className="text-xs text-muted-foreground">
                                                {weatherData.current.current.temp_c.toFixed(0)}°C
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Feels Like: {weatherData.current.current.feelslike_c.toFixed(0)}°C
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Wind: {weatherData.current.current.wind_kph} km/h {weatherData.current.current.wind_dir}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Gust: {weatherData.current.current.gust_kph} km/h
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Humidity: {weatherData.current.current.humidity}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Pressure: {weatherData.current.current.pressure_mb} mb
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Precipitation: {weatherData.current.current.precip_mm} mm
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Visibility: {weatherData.current.current.vis_km} km
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="flex flex-col w-full mt-4">
                            {weatherData.current &&
                                <div className="w-full gap-4 bg-zinc-300/50 p-4 rounded-md items-center">
                                    <p className="text-sm font-medium">Air Quality</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${getManualAirQualityColor(weatherData.current.current.air_quality['us-epa-index'])}`}></div>
                                        <p className="text-xs">
                                            Risk: {getManualAirQualityRisk(weatherData.current.current.air_quality['us-epa-index'])}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                            CO: {weatherData.current.current.air_quality.co.toFixed(0)} ppm
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            NO2: {weatherData.current.current.air_quality.no2.toFixed(0)} ppm
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            O3: {weatherData.current.current.air_quality.o3.toFixed(0)} ppm
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            SO2: {weatherData.current.current.air_quality.so2.toFixed(0)} ppm
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PM2.5: {weatherData.current.current.air_quality.pm2_5.toFixed(0)} ppm
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PM10: {weatherData.current.current.air_quality.pm10.toFixed(0)} ppm
                                        </p>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="flex flex-col w-full mt-4">
                            {weatherData.current && (
                                <div className="w-full gap-4 bg-zinc-300/50 p-4 rounded-md items-center">
                                    <p className="text-sm font-medium">Detailed Stats</p>
                                    <div className="grid grid-cols-3 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                            Cloud: {weatherData.current.current.cloud} %
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Wind Chill: {weatherData.current.current.windchill_c.toFixed(0)}°C
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Heat Index: {weatherData.current.current.heatindex_c.toFixed(0)}°C
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Dew Point: {weatherData.current.current.dewpoint_c.toFixed(0)}°C
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            UV Index: {weatherData.current.current.uv}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {history && history.length > 0 &&
                            <div className="flex flex-col gap-4 bg-zinc-300/50 p-4 rounded-md items-center">
                                <div className="flex flex-col w-full">
                                    <p className="text-sm font-medium">History</p>
                                    <p className="text-xs text-muted-foreground">Times are displayed in {new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]}</p>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {history.map((day) => (
                                            <div key={`history-${day.date_epoch}`} className="flex flex-col 
                                        items-center bg-zinc-50/75 py-2 rounded-md gap-2">
                                                <p className="text-xs">{new Date(day.date).toLocaleDateString()}</p>
                                                <Image
                                                    src={`https:${day.day.condition.icon}`}
                                                    alt={day.day.condition.text}
                                                    width={32}
                                                    height={32}
                                                />
                                                <div className="flex flex-col items-center text-center">
                                                    <p className="text-xs">H: {day.day.maxtemp_c.toFixed(0)}°C</p>
                                                    <p className="text-xs">L: {day.day.mintemp_c.toFixed(0)}°C</p>
                                                </div>
                                                <div className="flex flex-col items-center text-center">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Wind size={12} /> {day.day.maxwind_kph} km/h
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        {day.day.maxtemp_c <= 0 ? <Snowflake size={12} /> : <CloudRain size={12} />} {day.day.totalprecip_mm.toFixed(1)} mm
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        }
                    </>
                ) : (
                    <div className="flex items-center gap-1.5 h-fit">
                        <IoWarning className="text-muted-foreground" size={16} />
                        <p className="text-xs text-muted-foreground">
                            No weather data found
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}