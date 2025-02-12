import { RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "../ui/sidebar";
import Image from "next/image";
import { Balloon, BalloonEntry } from "@/types/generalTypes";

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
}

export default function AppSidebar({ refetch, activeBalloonEntry, balloonEntries, selectedHour, handleHourForward, handleHourBackward, lastFetch, loading, focusBalloon }: AppSidebarProps) {
  return (
    <Sidebar className="hidden lg:block">
      <SidebarHeader>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/assets/windborne-logo.png" alt="logo" width={40} height={40} />
            <div className="flex flex-col">
              <h2 className="text-lg h-6 font-semibold">Pindrop</h2>
              <p className="text-sm text-muted-foreground">
                John Liu
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            className="hover:bg-accent"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col justify-between h-full py-4">
          <div />
          {activeBalloonEntry && (
            <div className="flex flex-col items-center text-center">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium leading-none">Current Time</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeBalloonEntry.timestamp}
                </p>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleHourForward}
                    variant="outline"
                    size="icon"
                    disabled={!balloonEntries.some(entry => entry.offset > selectedHour) || (focusBalloon ? true : false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleHourBackward}
                    variant="outline"
                    size="icon"
                    disabled={!balloonEntries.some(entry => entry.offset < selectedHour) || (focusBalloon ? true : false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 flex items-center gap-2 animate-in fade-in duration-300">
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
      </SidebarFooter>
    </Sidebar>
  )
}