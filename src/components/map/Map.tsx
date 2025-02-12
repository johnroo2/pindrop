import { Balloon } from '@/types/generalTypes';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import BalloonMarker from './markers/balloon/BalloonMarker';
import { DisasterFeature } from '@/types/APITypes';
import DisasterMarker from './markers/disaster/DisasterMarker';

interface MapProps {
    balloons: (Balloon & { offset: number })[];
    focusBalloon?: Balloon & { id: number, offset: number };
    focusDisaster?: DisasterFeature;
    disasters: DisasterFeature[];
    setFocusBalloon: (balloon: Balloon & { id: number, offset: number } | undefined) => void;
    setFocusDisaster: (disaster: DisasterFeature | undefined) => void;
}

export default function Map({ balloons, focusBalloon, focusDisaster, disasters, setFocusBalloon, setFocusDisaster }: MapProps) {
    return (
        <MapContainer
            className="h-full w-full"
            center={[37.423463, -122.100944]}
            zoom={4}
            maxZoom={15}
            minZoom={3}
            maxBounds={[
                [-90, -182],
                [90, 182]
            ]}
            maxBoundsViscosity={1.0}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            />
            <>
                {balloons.map((balloon, index) => (
                    <BalloonMarker
                        key={`${index}-${focusBalloon ? 'fb' : 'b'}-${balloon.timestamp}`}
                        balloon={{
                            ...balloon,
                            id: focusBalloon?.id || index,
                            offset: balloon.offset
                        }}
                        index={index}
                        noHighlight={(focusBalloon ? true : false) && (focusBalloon?.timestamp !== balloon.timestamp)}
                        noFocus={focusDisaster ? true : focusBalloon ? false : true}
                        setFocusBalloon={setFocusBalloon}
                        setFocusDisaster={setFocusDisaster}
                    />
                ))}
            </>
            <>
                {disasters.map((disaster, index) => (
                    <DisasterMarker
                        key={`${index}-disaster-${JSON.stringify(disaster.geometry)}`}
                        index={index}
                        disaster={disaster}
                        setFocusBalloon={setFocusBalloon}
                        setFocusDisaster={setFocusDisaster}
                        noHighlight={focusBalloon ? true : (focusDisaster ? true : false) && (focusDisaster?.attributes.id !== disaster.attributes.id)}
                    />
                ))}
            </>
        </MapContainer>
    );
}