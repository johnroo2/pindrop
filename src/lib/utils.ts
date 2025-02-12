import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cardinalDirection(degrees: number) {
  const circleDegrees = degrees % 360;

  const cardinalDirection =
    circleDegrees === 0
      ? 'N'
      : circleDegrees === 90
      ? 'E'
      : circleDegrees === 180
      ? 'S'
      : circleDegrees === 270
      ? 'W'
      : circleDegrees === 360
      ? 'N'
      : circleDegrees > 0 && circleDegrees < 90
      ? `N ${circleDegrees.toFixed(0)}° E`
      : circleDegrees > 90 && circleDegrees < 180
      ? `S ${(180 - circleDegrees).toFixed(0)}° E`
      : circleDegrees > 180 && circleDegrees < 270
      ? `S ${(circleDegrees - 180).toFixed(0)}° W`
      : circleDegrees > 270 && circleDegrees < 360
      ? `N ${(360 - circleDegrees).toFixed(0)}° W`
      : 'N';
  return cardinalDirection;
}
