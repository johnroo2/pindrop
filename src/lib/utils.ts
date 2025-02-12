import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cardinalDirection(degrees: number) {
  const cardinalDirection =
    degrees < 22.5
      ? 'N'
      : degrees < 67.5
      ? 'NE'
      : degrees < 112.5
      ? 'E'
      : degrees < 157.5
      ? 'SE'
      : degrees < 202.5
      ? 'S'
      : degrees < 247.5
      ? 'SW'
      : degrees < 292.5
      ? 'W'
      : degrees < 337.5
      ? 'NW'
      : 'N';
  return cardinalDirection;
}
