import { DisasterFeature } from "@/types/APITypes";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, useMap } from "react-leaflet";
import DisasterIcon from "./DisasterIcon";
import { Balloon } from "@/types/generalTypes";

interface DisasterMarkerProps {
    index: number;
    disaster: DisasterFeature;
    setFocusBalloon: (balloon: Balloon & { id: number, offset: number } | undefined) => void;
    setFocusDisaster: (disaster: DisasterFeature) => void;
    noHighlight: boolean;
}

export default function DisasterMarker({ index, disaster, setFocusBalloon, setFocusDisaster, noHighlight }: DisasterMarkerProps) {
    const map = useMap();

    const iconMarkup = renderToStaticMarkup(
        <DisasterIcon
            disaster={disaster}
            noHighlight={noHighlight}
        />
    );
    const customIcon = L.divIcon({
        html: iconMarkup,
        className: 'custom-disaster-icon',
    });

    const position = [disaster.geometry.y, disaster.geometry.x];

    if (Number.isNaN(position[0]) || Number.isNaN(position[1]) || position[0] > 90 ||
        position[0] < -90 || position[1] > 180 || position[1] < -180) {
        return <></>
    }

    return (
        <Marker
            key={`${index}-disaster-${JSON.stringify(disaster.geometry)}`}
            position={position as [number, number]}
            icon={customIcon}
            eventHandlers={{
                click: () => {
                    setFocusBalloon(undefined);
                    setFocusDisaster(disaster);
                    map.setView([disaster.geometry.y, disaster.geometry.x], Math.max(map.getZoom(), 5), { animate: true, duration: 0.4 });
                }
            }}
        />
    )
}