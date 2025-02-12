import { Service } from '@/lib/serviceUtils';
import {
  DisasterQueryResponse,
  DisasterFeature,
  DisasterNewsArticle,
  DisasterNewsStats,
} from '@/types/APITypes';
import { AxiosError } from 'axios';

class DisasterService extends Service {
  constructor(url: string) {
    super(url);
  }

  async getDisasterData24h() {
    const res = await this.safeAxiosApply<DisasterQueryResponse>(
      async () =>
        await this.instance.get(
          'https://utility.arcgis.com/sharing/rss?url=https%3A%2F%2Fwww.gdacs.org%2Fxml%2Frss_24h.xml',
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )
    )();

    if (res instanceof AxiosError) {
      return res;
    }

    const targetLayer = res?.featureCollection?.layers?.find(
      (l) => l.name === 'Points'
    );
    if (!targetLayer) {
      return {
        isError: true,
        data: undefined,
      };
    }

    const features = targetLayer?.featureSet?.features;
    if (!features) {
      return {
        isError: true,
        data: undefined,
      };
    }

    const uniqueFeatures = features.reduce(
      (acc: DisasterFeature[], feature) => {
        const existingFeature = acc.find(
          (f) => f.attributes.id === feature.attributes.id
        );
        if (!existingFeature) {
          acc.push(feature);
        } else if (
          new Date(feature.attributes.todate) >
          new Date(existingFeature.attributes.todate)
        ) {
          const index = acc.indexOf(existingFeature);
          acc[index] = feature;
        }
        return acc;
      },
      []
    );

    return {
      isError: false,
      data: uniqueFeatures,
    };
  }

  async getDisasterData7d() {
    const res = await this.safeAxiosApply<DisasterQueryResponse>(
      async () =>
        await this.instance.get(
          'https://utility.arcgis.com/sharing/rss?url=https%3A%2F%2Fwww.gdacs.org%2Fxml%2Frss_7d.xml',
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )
    )();

    if (res instanceof AxiosError) {
      return res;
    }

    const targetLayer = res?.featureCollection?.layers?.find(
      (l) => l.name === 'Points'
    );
    if (!targetLayer) {
      return {
        isError: true,
        data: undefined,
      };
    }

    const features = targetLayer?.featureSet?.features;
    if (!features) {
      return {
        isError: true,
        data: undefined,
      };
    }

    const uniqueFeatures = features.reduce(
      (acc: DisasterFeature[], feature) => {
        const existingFeature = acc.find(
          (f) => f.attributes.eventid === feature.attributes.eventid
        );
        if (!existingFeature) {
          acc.push(feature);
        } else if (
          new Date(feature.attributes.todate) >
          new Date(existingFeature.attributes.todate)
        ) {
          const index = acc.indexOf(existingFeature);
          acc[index] = feature;
        }
        return acc;
      },
      []
    );

    return {
      isError: false,
      data: uniqueFeatures,
    };
  }

  async getNewsArticles(disaster: DisasterFeature) {
    const eventType = encodeURIComponent(disaster.attributes.eventtype);
    const eventId = encodeURIComponent(disaster.attributes.eventid);

    const articlesRes = await this.safeAxiosApply<DisasterNewsArticle[]>(
      async () =>
        await this.instance.get('/api/news/articles', {
          params: {
            eventType,
            eventId,
          },
        })
    )();

    if (articlesRes instanceof AxiosError) {
      return {
        isError: true,
        data: undefined,
      };
    }

    const statsRes = await this.safeAxiosApply<DisasterNewsStats>(
      async () =>
        await this.instance.get('/api/news/stats', {
          params: {
            eventType,
            eventId,
          },
        })
    )();

    if (statsRes instanceof AxiosError) {
      return {
        isError: true,
        data: undefined,
      };
    }

    return {
      isError: false,
      data: {
        articles: articlesRes,
        stats: statsRes,
      },
    };
  }
}

const disasterService = new DisasterService('');
export default disasterService;
