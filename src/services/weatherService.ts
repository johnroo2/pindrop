import { Service } from '@/lib/serviceUtils';
import {
  CurrentWeatherResponse,
  ForecastWeatherResponse,
  GetWeatherResponse,
  HistoryWeatherResponse,
} from '@/types/APITypes';
import { AxiosError } from 'axios';

class WeatherService extends Service {
  constructor(url: string) {
    super(url);
  }

  async getCurrentWeather(lat: number, lon: number) {
    return await this.safeAxiosApply<CurrentWeatherResponse>(
      async () =>
        await this.instance.get(`/api/weather/current?lat=${lat}&lon=${lon}`)
    )();
  }

  async getForecast(lat: number, lon: number) {
    return await this.safeAxiosApply<ForecastWeatherResponse>(
      async () =>
        await this.instance.get(`/api/weather/future?lat=${lat}&lon=${lon}`)
    )();
  }

  async getHistory(lat: number, lon: number) {
    return await this.safeAxiosApply<HistoryWeatherResponse>(
      async () =>
        await this.instance.get(`/api/weather/history?lat=${lat}&lon=${lon}`)
    )();
  }

  async getWeatherData(lat: number, lon: number): Promise<GetWeatherResponse> {
    const current = await this.getCurrentWeather(lat, lon);

    if (current instanceof AxiosError) {
      return {
        isError: true,
        isInvalidLand: current?.response?.data?.message === 'water',
      };
    }

    const forecast = await this.getForecast(lat, lon);
    const history = await this.getHistory(lat, lon);

    if (forecast instanceof AxiosError || history instanceof AxiosError) {
      return {
        isError: true,
        isInvalidLand: false,
      };
    }

    return {
      isError: false,
      isInvalidLand: false,
      current,
      forecast,
      history,
    };
  }
}

const weatherService = new WeatherService('');
export default weatherService;
