## Pindrop

Hi, and welcome to <b>Pindrop</b>, a data visualization tool for drawing connections between weather balloons and natural disasters.

#### Demo Video

<iframe src="https://drive.google.com/file/d/19nkIwe3NzUFPtcHaJiFnczXjy-Uer-nG/preview" width="640" height="480" allow="autoplay"></iframe>

If the embed isn't working, try this [link](https://drive.google.com/file/d/19nkIwe3NzUFPtcHaJiFnczXjy-Uer-nG/view?usp=sharing) instead.


#### Features

<ul>
    <li>
        <b>Balloons</b> - Live, robust updates from Windborne Systems&apos; dataset. Data points are included
        from salvagable files with all 1,000 balloons intact &mdash; this is necessary to plot and extrapolate ballon paths.
    </li>
    <li>
        <b>Disasters</b> - All significant natural disasters from the last 7 days, fetched from GDACS. Live data about relevant
        news, statistics, and severity is included for each disaster.
    </li>
    <li>
        <b>Weather</b> - Detailed weather data is included for each balloon, allowing for weather-related analysis regarding
        nearby disasters. Related data is also provided, including history and forecasts.
    </li>
    <li>
        <b>Visualization</b> - Balloons have their paths and velocities recorded and plotted on the map. Each balloon points to the
        nearest disaster (obtained via Haversine distance) and vice versa, enabling quick traversal between elements.
    </li>
</ul>

#### Sources

 <ul>
    <li>
        <b>Windborne Systems</b> - Balloon data
    </li>
    <li>
        <b>GDACS, ARCGIS Online</b> - Disaster data
    </li>
    <li>
        <b>WeatherAPI</b> - Weather data, including history and forecasts
    </li>
    <li>
        <b>Nominatim</b> - Land Geocoding
    </li>
    <li>
        <b>MarineRegions.org</b> - Ocean Geocoding
    </li>
    <li>
        <b>Corsproxy.io</b> - CORS proxy
    </li>
</ul>

#### Tech Stack

<ul>
    <li>
        React, Next.js, Tailwind CSS, TypeScript, Shadcn UI
    </li>
</ul>