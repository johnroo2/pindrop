import MapLegend from "@/components/map/MapLegend";
import MapLoader from "@/components/map/MapLoader";
import AppSidebar from "@/components/panels/AppSidebar";
import BalloonInfo from "@/components/panels/BalloonInfo";
import DisasterInfo from "@/components/panels/DisasterInfo";
import { SidebarProvider } from "@/components/ui/sidebar";
import ballonService from "@/services/balloonService";
import disasterService from "@/services/disasterService";
import { DisasterFeature, GeneralLocateResponse, GetNewsArticlesResponse } from "@/types/APITypes";
import { Balloon, BalloonEntry } from "@/types/generalTypes";
import { AxiosError } from "axios";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

const ClientMap = dynamic(
  () => import('@/components/map/Map'),
  {
    ssr: false,
    loading: () => <div></div>
  }
);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const [balloonEntries, setBalloonEntries] = useState<BalloonEntry[]>([]);
  const [activeBalloonEntry, setActiveBalloonEntry] = useState<BalloonEntry>();
  const [focusBalloon, setFocusBalloon] = useState<Balloon & { id: number, offset: number }>();
  const [balloonLocationMap, setBalloonLocationMap] = useState<Map<string, GeneralLocateResponse>>(new Map());

  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [lastFetch, setLastFetch] = useState<string>("");

  const [disasterData, setDisasterData] = useState<DisasterFeature[]>([]);
  const [focusDisaster, setFocusDisaster] = useState<DisasterFeature>();
  const [disasterLocationMap, setDisasterLocationMap] = useState<Map<string, GeneralLocateResponse>>(new Map());
  const [disasterNewsMap, setDisasterNewsMap] = useState<Map<string, GetNewsArticlesResponse>>(new Map());

  const onReload = useCallback(() => {
    const fetchDisasterData = async () => {
      const res = await disasterService.getDisasterData7d();
      if (res instanceof AxiosError) {
        setDisasterData([]);
      } else {
        if (res.data) {
          setDisasterData(res.data);
        } else {
          setDisasterData([])
        }
      }
    }

    const fetchBalloons = async () => {
      const now = new Date();
      setLastFetch(new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short',
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(now));
      const res = await ballonService.rollBackBallons(now, () => setLoadProgress(prev => prev + 1));

      if (res) {
        setBalloonEntries(res);
        setActiveBalloonEntry(res[0]);
      }
    };

    const loadData = async () => {
      setLoading(true);
      setLoadProgress(0);
      setActiveBalloonEntry(undefined);
      setBalloonEntries([]);
      setDisasterData([]);

      await Promise.all([fetchBalloons(), fetchDisasterData()]);

      setFocusBalloon(undefined);
      setFocusDisaster(undefined);
      setLoading(false);
      setTimeout(() => {
        setLoadProgress(0);
      }, 500);
    };

    loadData();
  }, []);

  useEffect(() => {
    onReload();
  }, [onReload]);

  const focusBalloonVersions = useMemo(() => {
    if (!focusBalloon || !balloonEntries) return [];
    return balloonEntries.filter(entry => entry.balloons.length === 1000)
      .map(entry => ({ ...entry.balloons[focusBalloon.id], offset: entry.offset }));
  }, [focusBalloon, balloonEntries]);

  const handleHourForward = async () => {
    let p = Math.min(23, selectedHour + 1);
    let entryFound = false;

    while (p <= 23) {
      const entry = balloonEntries.find(entry => entry.offset === p);

      if (entry) {
        setActiveBalloonEntry(entry);
        setSelectedHour(p);
        entryFound = true;
        break;
      }

      p++;
    }

    if (!entryFound) {
      setSelectedHour(selectedHour);
    }
  }

  const handleHourBackward = async () => {
    let p = Math.max(0, selectedHour - 1);
    let entryFound = false;

    while (p >= 0) {
      const entry = balloonEntries.find(entry => entry.offset === p);

      if (entry) {
        setActiveBalloonEntry(entry);
        setSelectedHour(p);
        entryFound = true;
        break;
      }

      p--;
    }

    if (!entryFound) {
      setSelectedHour(selectedHour);
    }
  }

  return (
    <SidebarProvider>
      <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] w-screen h-screen overflow-hidden">
        <div className="hidden lg:block lg:w-[300px] xl:w-[350px]">
          <AppSidebar
            refetch={onReload}
            activeBalloonEntry={activeBalloonEntry}
            balloonEntries={balloonEntries}
            selectedHour={selectedHour}
            handleHourForward={handleHourForward}
            handleHourBackward={handleHourBackward}
            lastFetch={lastFetch}
            loading={loading}
            focusBalloon={focusBalloon}
            disasters={disasterData}
            setFocusDisaster={setFocusDisaster}
            setFocusBalloon={setFocusBalloon}
          />
        </div>
        <main className="h-screen w-full">
          <div className="relative h-full">
            <div className={`absolute inset-0 transition-opacity duration-500 
              ${loading || !activeBalloonEntry || !(disasterData.length > 0) ?
                'opacity-100' :
                'opacity-0 pointer-events-none'}`}>
              <MapLoader progress={loadProgress} />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-500 
              ${loading || !activeBalloonEntry || !(disasterData.length > 0) ?
                'opacity-0 pointer-events-none' :
                'opacity-100'}`}>
              <ClientMap
                balloons={focusBalloonVersions.length > 0 ?
                  focusBalloonVersions :
                  (activeBalloonEntry?.balloons || []).map(balloon => ({ ...balloon, offset: selectedHour }))}
                disasters={disasterData}
                focusBalloon={focusBalloon}
                focusDisaster={focusDisaster}
                setFocusBalloon={setFocusBalloon}
                setFocusDisaster={setFocusDisaster}
              />
              <MapLegend />
              <BalloonInfo
                balloon={focusBalloon}
                focusBalloonVersions={focusBalloonVersions}
                setFocusBalloon={setFocusBalloon}
                setFocusDisaster={setFocusDisaster}
                balloonLocationMap={balloonLocationMap}
                setBalloonLocationMap={setBalloonLocationMap}
                disasters={disasterData}
              />
              <DisasterInfo
                disaster={focusDisaster}
                disasterLocationMap={disasterLocationMap}
                setDisasterLocationMap={setDisasterLocationMap}
                setFocusDisaster={setFocusDisaster}
                setFocusBalloon={setFocusBalloon}
                disasterNewsMap={disasterNewsMap}
                setDisasterNewsMap={setDisasterNewsMap}
                balloons={(activeBalloonEntry?.balloons || []).map((balloon, index) => ({ ...balloon, id: index, offset: selectedHour }))}
              />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
