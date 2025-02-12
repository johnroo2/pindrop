import { APIError, DisasterNewsStats, ServerResponses } from '@/types/APITypes';
import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function get_stats(
  req: NextApiRequest,
  res: NextApiResponse<DisasterNewsStats | APIError>
) {
  if (req.method !== 'GET') {
    return res
      .status(ServerResponses.METHOD_NOT_ALLOWED)
      .json({ message: 'method not allowed' });
  }

  const { eventType, eventId } = req.query;

  if (!eventType || !eventId) {
    return res
      .status(ServerResponses.BAD_REQUEST)
      .json({ message: 'missing event type or id' });
  }

  try {
    const stats: DisasterNewsStats | AxiosError = await axios
      .get(`https://www.gdacs.org/gdacsapi/api/emm/getemmnewsstatisticbykey`, {
        params: {
          eventtype: eventType,
          eventid: eventId,
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        if (error instanceof AxiosError) {
          return error;
        }
        return error;
      });

    if (stats instanceof AxiosError) {
      return res
        .status(ServerResponses.BAD_REQUEST)
        .json({ message: 'axios fetch error' });
    } else {
      return res.status(ServerResponses.SUCCESS).json(stats);
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
