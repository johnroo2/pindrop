import { NextApiRequest, NextApiResponse } from 'next';
import {
  APIError,
  CurrentWeatherResponse,
  NoWeatherResponses,
  ServerResponses,
} from '@/types/APITypes';
import axios, { AxiosError } from 'axios';

export default async function get_weather(
  req: NextApiRequest,
  res: NextApiResponse<CurrentWeatherResponse | APIError>
) {
  if (req.method !== 'GET') {
    return res
      .status(ServerResponses.METHOD_NOT_ALLOWED)
      .json({ message: 'method not allowed' });
  }

  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(ServerResponses.BAD_REQUEST)
      .json({ message: 'missing coords' });
  }

  try {
    const weather:
      | CurrentWeatherResponse
      | AxiosError<{
          error: {
            code: number;
            message: string;
          };
        }> = await axios
      .get(`https://api.weatherapi.com/v1/current.json`, {
        params: {
          key: process.env.OPEN_WEATHER_API_KEY,
          q: `${lat},${lon}`,
          aqi: 'yes',
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        if (error instanceof AxiosError) {
          return error;
        }
        return error;
      });

    if (weather instanceof AxiosError) {
      if (weather.response?.data?.error?.code === 1006) {
        return res
          .status(ServerResponses.BAD_REQUEST)
          .json({ message: NoWeatherResponses.INVALID_LAND });
      } else {
        return res
          .status(ServerResponses.BAD_REQUEST)
          .json({ message: 'axios fetch error' });
      }
    } else {
      return res.status(ServerResponses.SUCCESS).json(weather);
    }
  } catch (error) {
    console.log(error);
    if (error instanceof AxiosError) {
      return res
        .status(ServerResponses.INTERNAL_SERVER_ERROR)
        .json({ message: error.response?.data });
    } else if (error instanceof Error) {
      return res
        .status(ServerResponses.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
    return res
      .status(ServerResponses.INTERNAL_SERVER_ERROR)
      .json({ message: 'internal server error' });
  }
}
