import { DisasterFeature } from '@/types/APITypes';
import { Balloon } from '@/types/generalTypes';
import { cardinalDirection } from './utils';

import { LucideShield } from 'lucide-react';
import { PiPlantFill } from 'react-icons/pi';
import { MdVolcano } from 'react-icons/md';
import { RiEarthquakeFill, RiFloodFill, RiTyphoonFill } from 'react-icons/ri';
import { ImFire } from 'react-icons/im';

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export function getNearestBalloons(
  disaster: DisasterFeature | undefined,
  balloons: (Balloon & { id: number; offset: number })[]
) {
  if (!disaster) return [];

  const sortedBalloons = balloons.sort((a, b) => {
    const lat1 = disaster.geometry.y;
    const lon1 = disaster.geometry.x;
    const lat2A = a.position[0];
    const lon2A = a.position[1];
    const lat2B = b.position[0];
    const lon2B = b.position[1];

    const deltaLatA = toRadians(lat2A - lat1);
    const deltaLonA = toRadians(lon2A - lon1);
    const deltaLatB = toRadians(lat2B - lat1);
    const deltaLonB = toRadians(lon2B - lon1);

    const aA =
      Math.sin(deltaLatA / 2) * Math.sin(deltaLatA / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2A)) *
      Math.sin(deltaLonA / 2) *
      Math.sin(deltaLonA / 2);

    const aB =
      Math.sin(deltaLatB / 2) * Math.sin(deltaLatB / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2B)) *
      Math.sin(deltaLonB / 2) *
      Math.sin(deltaLonB / 2);

    return (
      Math.atan2(Math.sqrt(aA), Math.sqrt(1 - aA)) -
      Math.atan2(Math.sqrt(aB), Math.sqrt(1 - aB))
    );
  });

  return sortedBalloons.map((balloon) => {
    const lat1 = disaster.geometry.y;
    const lon1 = disaster.geometry.x;
    const lat2 = balloon.position[0];
    const lon2 = balloon.position[1];

    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    const y = Math.sin(lon2Rad - lon1Rad) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lon2Rad - lon1Rad);
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

    const earthRadiusKm = 6378;
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    return {
      ...balloon,
      direction: cardinalDirection(bearing),
      distance,
    };
  });
}

const disasterCodes = {
  DR: 'Drought',
  VO: 'Volcano',
  EQ: 'Earthquake',
  TC: 'Tropical Cyclone',
  FL: 'Flood',
  WF: 'Forest Fire',
};

export function getDisasterTitle(disaster: DisasterFeature) {
  if (!disaster) return '';

  if (
    disaster.attributes.eventtype &&
    Object.keys(disasterCodes).includes(disaster.attributes.eventtype)
  ) {
    let prefix = '';

    if (disaster.attributes.episodealertscore) {
      const score = Number.parseInt(disaster.attributes.episodealertscore);
      if (score == 0) {
        prefix = 'Very Low Severity - ';
      } else if (score == 1) {
        prefix = 'Low Severity - ';
      } else if (score == 2) {
        prefix = 'Moderate Severity - ';
      } else if (score >= 3) {
        prefix = 'High Severity - ';
      }
    }

    return `${prefix}${disasterCodes[disaster.attributes.eventtype as keyof typeof disasterCodes]
      }`;
  } else {
    return 'Unknown Disaster';
  }
}

export function DisasterIcon({ disaster }: { disaster: DisasterFeature }) {
  if (!disaster) {
    return <LucideShield size={20} className="text-red-500 min-w-[20px]" />
  }

  if (disaster.attributes.eventtype === 'DR') {
    return <PiPlantFill size={20} className="text-red-500 min-w-[20px]" />
  }

  if (disaster.attributes.eventtype === 'VO') {
    return <MdVolcano size={20} className="text-red-500 min-w-[20px]" />
  }

  if (disaster.attributes.eventtype === 'EQ') {
    return <RiEarthquakeFill size={20} className="text-red-500 min-w-[20px]" />
  }

  if (disaster.attributes.eventtype === 'TC') {
    return <RiTyphoonFill size={20} className="text-red-500 min-w-[20px]" />
  }

  if (disaster.attributes.eventtype === 'FL') {
    return <RiFloodFill size={20} className="text-red-500 min-w-[20px]" />
  }

  if (disaster.attributes.eventtype === 'WF') {
    return <ImFire size={20} className="text-red-500 min-w-[20px]" />
  }

  return <LucideShield size={20} className="text-red-500 min-w-[20px]" />
} 