import { Balloon } from "@/types/generalTypes";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, useMap } from "react-leaflet";
import BalloonIcon from "./BalloonIcon";
import { DisasterFeature } from "@/types/APITypes";

interface BalloonMarkerProps {
    balloon: Balloon & { id: number, offset: number };
    index: number;
    setFocusBalloon: (balloon: Balloon & { id: number, offset: number }) => void;
    noFocus: boolean;
    noHighlight: boolean;
    setFocusDisaster: (disaster: DisasterFeature | undefined) => void;
}

export default function BalloonMarker({ balloon, index, setFocusBalloon, noFocus, noHighlight, setFocusDisaster }: BalloonMarkerProps) {
    const map = useMap();

    const iconMarkup = renderToStaticMarkup(
        <BalloonIcon
            altitude={balloon.altitude}
            size={noFocus ? 18 : 22}
            noHighlight={noHighlight}
            noFocus={noFocus}
        />
    );
    const customIcon = L.divIcon({
        html: iconMarkup,
        className: 'custom-balloon-icon',
    });

    const position = [balloon.position[0], balloon.position[1]];

    if (Number.isNaN(position[0]) || Number.isNaN(position[1]) || position[0] > 90 ||
        position[0] < -90 || position[1] > 180 || position[1] < -180) {
        return <></>
    }

    return (
        <Marker
            key={`${index}-${balloon.timestamp}`}
            position={balloon.position as [number, number]}
            icon={customIcon}
            eventHandlers={{
                click: () => {
                    setFocusBalloon(balloon);
                    setFocusDisaster(undefined);
                    map.setView(position as [number, number], Math.max(map.getZoom(), 5), { animate: true, duration: 0.4 });
                }
            }}
        />
    );
};