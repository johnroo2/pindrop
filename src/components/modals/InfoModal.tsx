import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";

interface InfoModalProps {
    open: boolean;
    onClose: () => void;
}

export default function InfoModal({ open, onClose }: InfoModalProps) {

    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).id === "info-modal-overlay") {
            onClose();
        }
    };

    return (
        <div
            id="info-modal-overlay"
            className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[4000]
                 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={handleOutsideClick}
        >
            <Card className={`relative p-4 transition-transform duration-300 ${open ? 'translate-y-0' : '-translate-y-full'}`}>
                <button
                    className="absolute top-4 right-4"
                    onClick={onClose}
                >
                    ✕
                </button>
                <div className="w-[600px] max-w-[90vw] h-[375px] max-h-[90vh] grid grid-rows-[auto_1fr] overflow-y-auto overflow-x-hidden">
                    <div className="flex items-center gap-2">
                        <Image src="/assets/windborne-logo.png" alt="logo" width={40} height={40} />
                        <div className="flex flex-col">
                            <h2 className="text-lg h-6 font-semibold">Pindrop</h2>
                            <p className="text-sm text-muted-foreground">
                                About this project
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col mt-2 overflow-y-auto overflow-x-hidden rounded-md py-2">
                        <p className="text-sm">
                            Hi, and welcome to <b>Pindrop</b>, a data visualization tool for drawing connections between weather
                            balloons and natural disasters.
                        </p>
                        <Accordion type="multiple" className="w-full pr-4">
                            <AccordionItem value="features">
                                <AccordionTrigger>Features</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc list-inside">
                                        <li>
                                            <b>Balloons</b> - Live, robust updates from Windborne Systems&apos; dataset. Data points are included
                                            from salvagable files with all 1,000 balloons intact &mdash; this is necessary to plot and extrapolate ballon paths.
                                        </li>
                                        <li>
                                            <b>Disasters</b> - All significant natural disasters from the last 7 days, fetched from GDACS. Live data about relevant
                                            news, statistics, and severity is included for each disaster.
                                        </li>
                                        <li>
                                            <b>Weather</b> - Detailed weather data is included for each balloon, allowing for weather-related analysis regarding
                                            nearby disasters. Related data is also provided, including history and forecasts.
                                        </li>
                                        <li>
                                            <b>Visualization</b> - Balloons have their paths and velocities recorded and plotted on the map. Each balloon points to the
                                            nearest disaster (obtained via Haversine distance) and vice versa, enabling quick traversal between elements.
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sources">
                                <AccordionTrigger>Sources</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc list-inside">
                                        <li>
                                            <b>Windborne Systems</b> - Balloon data
                                        </li>
                                        <li>
                                            <b>GDACS, ARCGIS Online</b> - Disaster data
                                        </li>
                                        <li>
                                            <b>WeatherAPI</b> - Weather data, including history and forecasts
                                        </li>
                                        <li>
                                            <b>Nominatim</b> - Land Geocoding
                                        </li>
                                        <li>
                                            <b>MarineRegions.org</b> - Ocean Geocoding
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-stack">
                                <AccordionTrigger>Tech Stack</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>React</Badge>
                                        <Badge>Next.js</Badge>
                                        <Badge>Tailwind CSS</Badge>
                                        <Badge>TypeScript</Badge>
                                        <Badge>Shadcn UI</Badge>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="relevant-links">
                                <AccordionTrigger>Relevant Links</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc list-inside">
                                        <li className="underline">
                                            <Link href="https://github.com/johnroo2/pindrop" target="_blank" className="hover:text-blue-500">Github Repository</Link>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button onClick={onClose}>
                            Sounds good!
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}