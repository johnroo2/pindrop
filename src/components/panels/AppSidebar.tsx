import { DisasterIcon, getDisasterTitle } from "@/lib/disasterUtils";
import { DisasterFeature } from "@/types/APITypes";
import { Balloon, BalloonEntry } from "@/types/generalTypes";
import { ChevronLeft, ChevronRight, Info, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RiGithubFill } from "react-icons/ri";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";
import InfoModal from "../modals/InfoModal";

interface AppSidebarProps {
  refetch: () => void;
  activeBalloonEntry: BalloonEntry | undefined;
  balloonEntries: BalloonEntry[];
  selectedHour: number;
  handleHourForward: () => void;
  handleHourBackward: () => void;
  lastFetch: string;
  loading: boolean;
  focusBalloon: Balloon & { id: number, offset: number } | undefined;
  disasters: DisasterFeature[];
  setFocusDisaster: (disaster: DisasterFeature) => void;
  setFocusBalloon: (balloon: Balloon & { id: number, offset: number } | undefined) => void;
}

export default function AppSidebar({ refetch, activeBalloonEntry, balloonEntries, selectedHour, handleHourForward, handleHourBackward, lastFetch, loading, focusBalloon, disasters, setFocusDisaster, setFocusBalloon }: AppSidebarProps) {
  const [query, setQuery] = useState('');
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('pindrop-info-modal-seen')) {
      setInfoModalOpen(true);
      localStorage.setItem('pindrop-info-modal-seen', 'true');
    }
  }, [])

  const filteredDisasters = disasters.filter(disaster => {
    const name = disaster.attributes.name.toLowerCase().trim();
    const country = disaster.attributes.country.toLowerCase().trim();
    const queryLower = query.toLowerCase().trim();
    return name.includes(queryLower) || country.includes(queryLower);
  }).sort((a, b) => {
    const queryLower = query.toLowerCase().trim();
    const nameA = a.attributes.name.toLowerCase().trim();
    const nameB = b.attributes.name.toLowerCase().trim();

    if (nameA.includes(queryLower) && !nameB.includes(queryLower)) {
      return -1;
    } else if (!nameA.includes(queryLower) && nameB.includes(queryLower)) {
      return 1;
    } else {
      return Number.parseInt(b.attributes.alertscore) - Number.parseInt(a.attributes.alertscore);
    }
  });

  return (
    <>
      <Sidebar className="hidden lg:block lg:w-[300px] xl:w-[350px]">
        <SidebarHeader>
          <div className="pt-4 px-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/assets/windborne-logo.png" alt="logo" width={40} height={40} />
              <div className="flex flex-col">
                <h2 className="text-lg h-6 font-semibold">Pindrop</h2>
                <p className="text-sm text-muted-foreground">
                  John Liu
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="icon"
                className="bg-zinc-800 hover:bg-zinc-700"
                onClick={() => setInfoModalOpen(true)}
              >
                <Info size={20} />
              </Button>
              <Link href="https://github.com/johnroo2/pindrop" target="_blank">
                <Button
                  variant="default"
                  size="icon"
                  className="bg-zinc-800 hover:bg-zinc-700"
                >
                  <RiGithubFill size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="grid grid-rows-[1fr_auto] h-full overflow-y-auto gap-4">
            <div className="grid grid-rows-[auto_auto_1fr] overflow-y-auto px-4 gap-1">
              <div className="relative mt-0.5">
                <Input
                  placeholder="Search Disasters..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pr-10"
                  disabled={loading}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>
              {loading ? (
                <Skeleton className="h-4 w-1/2" />
              ) : (
                <p className="text-xs text-muted-foreground">{filteredDisasters.length} results</p>
              )}

              <div className="flex flex-col gap-1 overflow-y-auto rounded-md">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-[7.5rem] w-full" />
                  ))
                ) : (
                  filteredDisasters.map((disaster, index) => (
                    <button
                      key={`${disaster.attributes.id}-${index}`} className="h-[7.5rem] p-2 rounded-md bg-zinc-300/50 hover:bg-zinc-300/90 transition-all duration-300 shadow-sm grid grid-cols-[auto_1fr] gap-3 items-center"
                      onClick={() => {
                        setFocusDisaster(disaster);
                        setFocusBalloon(undefined);
                      }}
                    >
                      <div className="w-8 h-8 bg-accent/75 rounded-md flex items-center justify-center">
                        <DisasterIcon disaster={disaster} />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <h3 className="text-sm text-foreground font-semibold">
                          {disaster.attributes.name.split(/[,\.(]/)[0]}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Category: {getDisasterTitle(disaster)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {disaster.attributes.eventid}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(disaster.attributes.todate).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div>
              {activeBalloonEntry && (
                <div className="flex flex-col items-center text-center">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium leading-none">Current Time {selectedHour === 0 ? '' : `(-${selectedHour} hr${`${selectedHour === 1 ? '' : 's'}`})`}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeBalloonEntry.timestamp}
                    </p>
                  </div>
                  <div className={`mt-1 transition-all duration-300 ease-in-out origin-bottom 
                  overflow-y-hidden ${focusBalloon ? 'max-h-0' : 'max-h-[5rem]'}`}>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleHourForward}
                        variant="outline"
                        size="icon"
                        disabled={!balloonEntries.some(entry => entry.offset > selectedHour)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleHourBackward}
                        variant="outline"
                        size="icon"
                        disabled={!balloonEntries.some(entry => entry.offset < selectedHour)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <div className="px-4 pb-4 pt-2 flex items-center gap-2 animate-in fade-in duration-300">
              {loading ? (
                <>
                  <div className="min-w-3 h-3 rounded-full bg-gray-500" />
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">
                      Status: Loading...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last fetch: {lastFetch}
                    </p>
                  </div>
                </>
              ) : activeBalloonEntry && (
                <>
                  <div className={`min-w-3 w-3 h-3 rounded-full ${activeBalloonEntry.balloons.length === 1000 ? 'bg-green-500' :
                    activeBalloonEntry.balloons.length > 0 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="font-medium">{
                        activeBalloonEntry.balloons.length === 1000 ? 'Data Complete' :
                          activeBalloonEntry.balloons.length > 0 ? 'Missing Some Data' :
                            'Critical Data Loss'
                      }</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Last fetch: {lastFetch}</p>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refetch}
              className="hover:bg-accent"
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <InfoModal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </>
  )
}