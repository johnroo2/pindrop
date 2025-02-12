import { DisasterFeature } from '@/types/APITypes';
import { Balloon } from '@/types/generalTypes';
import { cardinalDirection } from './utils';

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export const getColor = (alt: number) => {
  if (alt > 20) {
    return 'text-violet-400';
  } else if (alt > 15) {
    return 'text-indigo-400';
  } else if (alt > 10) {
    return 'text-blue-400';
  } else if (alt > 5) {
    return 'text-sky-400';
  } else {
    return 'text-cyan-400';
  }
};

export function getNearestDisasters(
  balloon: (Balloon & { id: number; offset: number }) | undefined,
  disasters: DisasterFeature[]
) {
  if (!balloon) return [];

  const sortedDisasters = disasters.sort((a, b) => {
    const lat1 = balloon.position[0];
    const lon1 = balloon.position[1];
    const lat2A = a.geometry.y;
    const lon2A = a.geometry.x;
    const lat2B = b.geometry.y;
    const lon2B = b.geometry.x;

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

  return sortedDisasters.map((disaster) => {
    const lat1 = balloon.position[0];
    const lon1 = balloon.position[1];
    const lat2 = disaster.geometry.y;
    const lon2 = disaster.geometry.x;

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
      ...disaster,
      direction: cardinalDirection(bearing),
      distance,
    };
  });
}

export function getExtrapoledVelocity(
  balloon: (Balloon & { id: number; offset: number }) | undefined,
  focusBalloonVersions: (Balloon & { offset: number })[]
) {
  if (!balloon || focusBalloonVersions.length < 2) return [0, 0];

  const sortedVersions = [...focusBalloonVersions]
    .sort((a, b) => a.offset - b.offset)
    .reduce((acc: (Balloon & { offset: number })[], version) => {
      const exists = acc.some(
        (v) =>
          v.position[0] === version.position[0] &&
          v.position[1] === version.position[1]
      );
      if (!exists) {
        acc.push(version);
      }
      return acc;
    }, []);

  const currentIndex = sortedVersions.findIndex(
    (version) =>
      version.position[0] === balloon.position[0] &&
      version.position[1] === balloon.position[1]
  );

  let b1, b2;
  if (currentIndex > 0 && currentIndex < sortedVersions.length - 1) {
    b1 = sortedVersions[currentIndex - 1];
    b2 = sortedVersions[currentIndex + 1];
  } else {
    b1 = sortedVersions[Math.max(0, currentIndex - 1)];
    b2 = sortedVersions[Math.min(sortedVersions.length - 1, currentIndex + 1)];
  }

  const lat1 = toRadians(b1.position[0]);
  const lon1 = toRadians(b1.position[1]);
  const lat2 = toRadians(b2.position[0]);
  const lon2 = toRadians(b2.position[1]);

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const earthRadius = 6378;
  const distance = earthRadius * c;
  const timeDifference = b2.offset - b1.offset;
  const speed = timeDifference > 0 ? distance / (timeDifference * 3.6) : 0;

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 180) % 360;

  return [speed, bearing];
}

export function getExtrapolatedVelocityString(
  balloon: (Balloon & { id: number; offset: number }) | undefined,
  focusBalloonVersions: (Balloon & { offset: number })[]
) {
  if (!balloon || focusBalloonVersions.length === 0) return '0 m/s';

  const [speed, direction] = getExtrapoledVelocity(
    balloon,
    focusBalloonVersions
  );
  return `${speed.toFixed(2)} m/s ${cardinalDirection(direction)}`;
}
