import { Service } from '@/lib/serviceUtils';
import {
  GeneralLocateResponse,
  GeoLocateResponse,
  MarineLocateResponse,
  MarineLocateResponseInstance,
  NoWeatherResponses,
} from '@/types/APITypes';
import { AxiosError } from 'axios';

class GeoService extends Service {
  constructor(url: string) {
    super(url);
  }

  async getGeoLocation(lat: number, lon: number) {
    return await this.safeAxiosApply<GeoLocateResponse>(
      async () =>
        await this.instance.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        )
    )();
  }

  async getMarineLocation(lat: number, lon: number) {
    return await this.safeAxiosApply<MarineLocateResponse>(
      async () =>
        await this.instance.get(
          `https://www.marineregions.org/rest/getGazetteerRecordsByLatLong.json/${lat}/${lon}/?offset=0&format=json`
        )
    )();
  }

  async getGeneralLocation(
    lat: number,
    lon: number
  ): Promise<GeneralLocateResponse> {
    const geoResponse = await this.getGeoLocation(lat, lon);

    if (geoResponse instanceof AxiosError) {
      return {
        isError: true,
        dataType: 'none',
        data: undefined,
      };
    } else {
      if (geoResponse?.error === NoWeatherResponses.INVALID_GEOCODE) {
        const marineResponse = await this.getMarineLocation(lat, lon);

        if (marineResponse instanceof AxiosError) {
          return {
            isError: true,
            dataType: 'none',
            data: undefined,
          };
        } else {
          const wikiResponse = marineResponse.filter(
            (r) =>
              r?.preferredGazetteerName.length > 4 &&
              r?.preferredGazetteerName.length < 20 &&
              [
                'wikipedia',
                'wikimedia foundation',
                'large marine ecosystems of the world',
                'the seavox salt and fresh water body gazetteer',
              ].some((w) =>
                (r?.preferredGazetteerName || '')?.toLowerCase().includes(w)
              )
          );
          const oceanResponse = marineResponse.filter(
            (r) =>
              r?.preferredGazetteerName.length > 4 &&
              r?.preferredGazetteerName.length < 20 &&
              r?.placeType === 'Ocean'
          );
          const realmResponse = marineResponse.filter(
            (r) =>
              r?.preferredGazetteerName.length > 4 &&
              r?.preferredGazetteerName.length < 20 &&
              r?.placeType === 'Realm'
          );
          const keywordResponse = marineResponse.filter(
            (r) =>
              r?.preferredGazetteerName.length > 4 &&
              r?.preferredGazetteerName.length < 20 &&
              ['gulf', 'sea', 'ocean'].some((word) =>
                (r?.preferredGazetteerName || '')?.toLowerCase().includes(word)
              )
          );
          const mediumResponse = marineResponse.filter(
            (r) =>
              r?.preferredGazetteerName.length > 4 &&
              r?.preferredGazetteerName.length < 20 &&
              ![
                'world',
                'planet',
                'planeet',
                'earth',
                'realm',
                'realms',
              ].includes((r?.preferredGazetteerName || '')?.toLowerCase())
          );

          const reducer = (
            a: MarineLocateResponseInstance,
            b: MarineLocateResponseInstance
          ) => {
            return a.preferredGazetteerName.length <
              b.preferredGazetteerName.length
              ? a
              : b;
          };

          if (wikiResponse && wikiResponse.length > 0) {
            return {
              isError: false,
              dataType: 'marine',
              data: wikiResponse.reduce(reducer),
            };
          } else if (oceanResponse && oceanResponse.length > 0) {
            return {
              isError: false,
              dataType: 'marine',
              data: oceanResponse.reduce(reducer),
            };
          } else if (keywordResponse && keywordResponse.length > 0) {
            return {
              isError: false,
              dataType: 'marine',
              data: keywordResponse.reduce(reducer),
            };
          } else if (mediumResponse && mediumResponse.length > 0) {
            return {
              isError: false,
              dataType: 'marine',
              data: mediumResponse.reduce(reducer),
            };
          } else if (realmResponse && realmResponse.length > 0) {
            return {
              isError: false,
              dataType: 'marine',
              data: realmResponse.reduce(reducer),
            };
          } else {
            return {
              isError: false,
              dataType: 'marine',
              data: marineResponse.reduce(reducer),
            };
          }
        }
      }
      return {
        isError: false,
        dataType: 'geo',
        data: geoResponse,
      };
    }
  }
}

const geoService = new GeoService('');
export default geoService;
