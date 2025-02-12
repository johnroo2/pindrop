import { Balloon } from "@/types/generalTypes";
import { ChartOptions } from "chart.js";
import { useMemo } from "react";

export default function UseBalloonAltitude(
    balloon: Balloon & { id: number, offset: number } | undefined,
    focusBalloonVersions: (Balloon & { offset: number })[]
) {
    const altitudeSetup = useMemo(() => {
        if (!balloon || focusBalloonVersions.length === 0) return { labels: [], datasets: [] };

        const labels = Array.from({ length: 24 }, (_, i) => 23 - i);
        const data = new Array(24).fill(null);

        focusBalloonVersions.forEach(version => {
            data[23 - version.offset] = version.altitude;
        });

        data[23 - balloon.offset] = balloon.altitude;

        let lastKnownValue = null;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === null) {
                let prevIndex = i - 1;
                let nextIndex = i + 1;

                while (prevIndex >= 0 && data[prevIndex] === null) {
                    prevIndex--;
                }

                while (nextIndex < data.length && data[nextIndex] === null) {
                    nextIndex++;
                }

                if (prevIndex >= 0 && nextIndex < data.length) {
                    const prevValue = data[prevIndex];
                    const nextValue = data[nextIndex];
                    const offsetDiff = nextIndex - prevIndex;
                    const valueDiff = nextValue - prevValue;
                    const step = valueDiff / offsetDiff;
                    data[i] = prevValue + step * (i - prevIndex);
                } else if (prevIndex >= 0) {
                    data[i] = data[prevIndex];
                } else if (nextIndex < data.length) {
                    data[i] = data[nextIndex];
                } else if (lastKnownValue !== null) {
                    data[i] = lastKnownValue;
                }
            } else {
                lastKnownValue = data[i];
            }
        }

        for (let i = 1; i < data.length; i++) {
            if (data[i] !== null && data[i - 1] !== null) {
                const diff = Math.abs(data[i] - data[i - 1]);
                if (diff > 5) {
                    data[i] = data[i - 1] + Math.sign(data[i] - data[i - 1]) * 5;
                }
            }
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Altitude',
                    data,
                    fill: true,
                    backgroundColor: 'rgba(20, 10, 0, 0.2)',
                    borderColor: 'rgba(20, 10, 0, 0.4)',
                    borderWidth: 1,
                    pointRadius: data.map((_, index) => index === (23 - balloon.offset) ? 4 : 2),
                    pointBackgroundColor: 'rgba(20, 10, 0, 0.8)',
                    tension: 0.25,
                },
            ],
        };
    }, [balloon, focusBalloonVersions]);

    const chartOptions: ChartOptions<'line'> = useMemo(() => {
        if (focusBalloonVersions.length === 0) return {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            }
        };

        return {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            const value = Number.parseInt(context[0].label);
                            return value === 0 ? 'Present' : `-${value}h`;
                        },
                        label: function (context) {
                            const value = context.raw as number;
                            return `${value.toFixed(2)} km`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
                x: {
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        display: false,
                        maxTicksLimit: 8,
                    }
                }
            }
        }
    }, [focusBalloonVersions]);

    return { altitudeSetup, chartOptions };
}