export interface APIError {
  message: string;
}

export interface GetWeatherResponse {
  isError: boolean;
  isInvalidLand: boolean;
  current?: CurrentWeatherResponse;
  forecast?: ForecastWeatherResponse;
  history?: HistoryWeatherResponse;
}

export enum ServerResponses {
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
  METHOD_NOT_ALLOWED = 405,
  SUCCESS = 200,
}

export enum NoWeatherResponses {
  INVALID_LAND = 'invalid land',
  INVALID_GEOCODE = 'Unable to geocode',
}

export interface CurrentWeatherResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    windchill_c: number;
    windchill_f: number;
    heatindex_c: number;
    heatindex_f: number;
    dewpoint_c: number;
    dewpoint_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
}

export interface ForecastWeatherResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        maxwind_mph: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        totalsnow_cm: number;
        avgvis_km: number;
        avgvis_miles: number;
        avghumidity: number;
        daily_will_it_rain: number;
        daily_chance_of_rain: number;
        daily_will_it_snow: number;
        daily_chance_of_snow: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
      };
      hour: Array<{
        time_epoch: number;
        time: string;
        temp_c: number;
        temp_f: number;
        is_day: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_mph: number;
        wind_kph: number;
        wind_degree: number;
        wind_dir: string;
        pressure_mb: number;
        pressure_in: number;
        precip_mm: number;
        precip_in: number;
        humidity: number;
        cloud: number;
        feelslike_c: number;
        feelslike_f: number;
        windchill_c: number;
        windchill_f: number;
        heatindex_c: number;
        heatindex_f: number;
        dewpoint_c: number;
        dewpoint_f: number;
        will_it_rain: number;
        chance_of_rain: number;
        will_it_snow: number;
        chance_of_snow: number;
        vis_km: number;
        vis_miles: number;
        gust_mph: number;
        gust_kph: number;
        uv: number;
      }>;
    }>;
  };
}

export interface HistoryWeatherResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        maxwind_mph: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        totalsnow_cm: number;
        avgvis_km: number;
        avgvis_miles: number;
        avghumidity: number;
        daily_will_it_rain: number;
        daily_chance_of_rain: number;
        daily_will_it_snow: number;
        daily_chance_of_snow: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
      };
      hour: Array<{
        time_epoch: number;
        time: string;
        temp_c: number;
        temp_f: number;
        is_day: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_mph: number;
        wind_kph: number;
        wind_degree: number;
        wind_dir: string;
        pressure_mb: number;
        pressure_in: number;
        precip_mm: number;
        precip_in: number;
        humidity: number;
        cloud: number;
        feelslike_c: number;
        feelslike_f: number;
        windchill_c: number;
        windchill_f: number;
        heatindex_c: number;
        heatindex_f: number;
        dewpoint_c: number;
        dewpoint_f: number;
        will_it_rain: number;
        chance_of_rain: number;
        will_it_snow: number;
        chance_of_snow: number;
        vis_km: number;
        vis_miles: number;
        gust_mph: number;
        gust_kph: number;
        uv: number;
      }>;
    }>;
  };
}

export interface GeoLocateResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    house_number: string;
    road: string;
    city: string;
    county: string;
    state: string;
    'ISO3166-2-lvl4': string;
    postcode: string;
    country: string;
    country_code: string;
  };
  boundingbox: string[];
  error?: string;
}

export interface MarineLocateResponseInstance {
  MRGID: number;
  gazetteerSource: string;
  placeType: string;
  latitude: number;
  longitude: number;
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
  precision: number;
  preferredGazetteerName: string;
  preferredGazetteerNameLang: string;
  status: string;
  accepted: number;
}

export type MarineLocateResponse = MarineLocateResponseInstance[];

export type GeneralLocateResponse =
  | { isError: boolean; dataType: 'none'; data: undefined }
  | { isError: false; dataType: 'geo'; data: GeoLocateResponse }
  | { isError: false; dataType: 'marine'; data: MarineLocateResponseInstance };

export interface DisasterFeature {
  geometry: {
    x: number;
    y: number;
  };
  attributes: {
    id: number;
    name: string;
    visibility: number;
    description: string;
    copyright: string;
    title: string;
    link: string;
    guid: string;
    pubDate: string;
    temporary: string;
    dateadded: string;
    datemodified: string;
    iscurrent: string;
    fromdate: string;
    todate: string;
    durationinweek: string;
    year: string;
    subject: string;
    bbox: string;
    cap: string;
    icon: string;
    version: string;
    eventtype: string;
    alertlevel: string;
    alertscore: string;
    episodealertlevel: string;
    episodealertscore: string;
    eventname: string;
    eventid: string;
    episodeid: string;
    calculationtype: string;
    severity: string;
    population: string;
    vulnerability: string;
    iso3: string;
    country: string;
    glide: string;
    mapimage: string;
    maplink: string;
    gtsimage: string;
    gtslink: string;
    resources: string;
  };
}

export interface DisasterQueryResponse {
  RssVersion: string;
  id: number;
  name: string;
  description: string;
  author: string;
  visibility: number;
  balloonStyleText: string | null;
  lookAtExtent: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: {
      wkid: number;
    };
  };
  featureCollection: {
    layers: Array<{
      name: string;
      layerDefinition: {
        type: string;
        geometryType: string;
        extent: {
          xmin: number;
          ymin: number;
          xmax: number;
          ymax: number;
          spatialReference: {
            wkid: number;
          };
        };
        objectIdField: string;
        visibilityField: string;
        displayFieldName: string;
        drawingInfo: {
          renderer: {
            type: string;
            label: string;
            description: string;
            symbol: {
              type: string;
              style: string;
              color: number[];
              outline: {
                type: string;
                style: string;
                color: number[];
                width: number;
              };
            };
          };
        };
        fields: Array<{
          name: string;
          alias: string;
          type: string;
          length?: number;
        }>;
      };
      featureSet: {
        geometryType: string;
        spatialReference: {
          wkid: number;
        };
        features: Array<DisasterFeature>;
      };
      popupInfo: {
        title: string;
        description: string;
        temporary: string;
        dateadded: string;
        datemodified: string;
        iscurrent: string;
        fromdate: string;
        todate: string;
        durationinweek: string;
        year: string;
        subject: string;
        bbox: string;
        cap: string;
        icon: string;
        version: string;
        eventtype: string;
        alertlevel: string;
        alertscore: string;
        episodealertlevel: string;
        episodealertscore: string;
        eventname: string;
        eventid: string;
        episodeid: string;
        calculationtype: string;
        severity: string;
        population: string;
        vulnerability: string;
        iso3: string;
        country: string;
        glide: string;
        mapimage: string;
        maplink: string;
        gtsimage: string;
        gtslink: string;
        resources: string;
      };
    }>;
  };
}

export interface DisasterNewsArticle {
  emmid: string;
  pubdate: string;
  source: string;
  link: string;
  title: string;
  description: string;
}

export interface DisasterNewsStats {
  coverage: {
    total: number;
    casualties: number;
    casualtiesx100: number;
    lastHour: number;
  };
  dailyNews: Array<{
    date: string;
    dateString: string;
    total: number;
  }>;
}

export interface GetNewsArticlesResponse {
  stats: DisasterNewsStats;
  articles: DisasterNewsArticle[];
}
