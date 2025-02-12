export interface Balloon {
  position: number[];
  altitude: number;
  timestamp: string;
}

export interface BalloonEntry {
  offset: number;
  timestamp: string;
  balloons: Balloon[];
}
