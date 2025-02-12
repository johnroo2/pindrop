import { Service } from '@/lib/serviceUtils';
import { Balloon, BalloonEntry } from '@/types/generalTypes';
import { AxiosError } from 'axios';

class BalloonService extends Service {
  constructor(url: string) {
    super(url);
  }

  async getBalloonsAtHour(
    hour: number,
    fetchTime: Date
  ): Promise<Balloon[] | undefined> {
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }

    const res = await this.safeAxiosApply<string>(
      async () =>
        await this.instance.get(
          `https://corsproxy.io/?url=https://a.windbornesystems.com/treasure/${hour
            .toString()
            .padStart(2, '0')}.json`
        )
    )();

    if (res instanceof AxiosError) {
      if (res.response?.status === 404) {
        console.warn(`no balloons found for this hour: ${hour}`);
      } else {
        console.error(res.response?.data);
      }
      return undefined;
    } else {
      try {
        let parsedRes: number[][];

        if (typeof res === 'string') {
          let cleanedString = res
            .replace(/\s+/g, '')
            .replace(/\bNaN\b/g, 'null')
            .trim();

          if (cleanedString.length > 1) {
            if (cleanedString[1] !== '[') {
              cleanedString = `[${cleanedString}`;
            }
            if (cleanedString[cleanedString.length - 2] !== ']') {
              cleanedString = `${cleanedString}]`;
            }
          }

          parsedRes = JSON.parse(cleanedString)
            .map((row: (number | null)[]) =>
              row.map((val) => (val === null ? NaN : val))
            )
            .filter((row: (number | null)[]) =>
              row.every((val) => val !== null)
            );
        } else if (Array.isArray(res)) {
          parsedRes = (res as unknown as number[][])
            .map((row: (number | null)[]) =>
              row.map((val) => (val === null ? NaN : val))
            )
            .filter((row) => row.every((val) => val !== null));
        } else {
          console.error('unexpected response format:', res);
          return undefined;
        }

        const formattedBalloons = parsedRes
          .map((data: number[]) => {
            if (data.length === 3) {
              const [lat, lon, alt] = data;
              const offsetTime = new Date(
                fetchTime.getTime() - hour * 60 * 60 * 1000
              );

              return {
                position: [lat, lon],
                altitude: alt,
                timestamp: new Intl.DateTimeFormat('en-US', {
                  timeZoneName: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                }).format(offsetTime),
              };
            } else {
              console.error('unexpected data length:', data);
              return null;
            }
          })
          .filter((balloon) => balloon !== null);

        return formattedBalloons;
      } catch (e) {
        console.log(hour);
        console.error('Error parsing balloon data:', e);
      }
    }
  }

  async rollBackBallons(
    fetchTime: Date,
    callback: () => void
  ): Promise<BalloonEntry[]> {
    const entries: BalloonEntry[] = [];
    let hour = 0;

    while (hour < 24) {
      const res = await this.getBalloonsAtHour(hour, fetchTime);
      if (res) {
        const date = new Date(fetchTime.getTime() - hour * 60 * 60 * 1000);
        const timestamp = new Intl.DateTimeFormat('en-US', {
          timeZoneName: 'short',
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }).format(date);

        entries.push({
          offset: hour,
          timestamp,
          balloons: res,
        });
      }
      hour++;
      callback();
    }
    return entries;
  }
}

const ballonService = new BalloonService('');
export default ballonService;
