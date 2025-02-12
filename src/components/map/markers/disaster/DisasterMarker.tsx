import { DisasterFeature } from "@/types/APITypes";
import { Balloon } from "@/types/generalTypes";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker } from "react-leaflet";
import DisasterIcon from "./DisasterIcon";

interface DisasterMarkerProps {
    index: number;
    disaster: DisasterFeature;
    setFocusBalloon: (balloon: Balloon & { id: number, offset: number } | undefined) => void;
    setFocusDisaster: (disaster: DisasterFeature) => void;
    noHighlight: boolean;
}

export default function DisasterMarker({ index, disaster, setFocusBalloon, setFocusDisaster, noHighlight }: DisasterMarkerProps) {
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
                }
            }}
        />
    )
}