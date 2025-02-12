import { GetNewsArticlesResponse } from "@/types/APITypes";
import { ChartOptions } from "chart.js";
import { useMemo } from "react";

export default function UseDisasterNewsStats(newsData: GetNewsArticlesResponse | undefined) {
    const newsChartData = useMemo(() => {
        if (!newsData) return { labels: [], datasets: [] };

        const dailyNews = newsData.stats.dailyNews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const startDate = new Date(dailyNews[0].date);
        const endDate = new Date(dailyNews[dailyNews.length - 1].date);
        const totalMilliseconds = endDate.getTime() - startDate.getTime();
        const numberOfIntervals = Math.min(8, dailyNews.length);
        const interval = Math.ceil(totalMilliseconds / numberOfIntervals);

        const labels = [];
        const data = [];

        for (let i = 0; i < numberOfIntervals; i++) {
            const intervalStart = new Date(startDate.getTime() + i * interval);
            const intervalEnd = new Date(intervalStart.getTime() + interval - 1);

            let label;
            if (totalMilliseconds < 8 * 24 * 60 * 60 * 1000) {
                label = `${intervalStart.toLocaleString('default', { month: 'short' })} ${intervalStart.getDate()}, ${intervalStart.toLocaleTimeString('default', { hour: 'numeric', hour12: true })}`;
            } else {
                label = `${intervalStart.toLocaleString('default', { month: 'short' })} ${intervalStart.getDate()} ${intervalStart.getFullYear()}`;
            }
            labels.push(label);

            const intervalData = dailyNews.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= intervalStart && itemDate <= intervalEnd;
            }).reduce((sum, item) => sum + item.total, 0);

            data.push(intervalData);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Daily News Articles',
                    data,
                    backgroundColor: 'rgba(20, 10, 0, 0.2)',
                    borderColor: 'rgba(20, 10, 0, 0.4)',
                    borderWidth: 1,
                },
            ],
        };
    }, [newsData]);

    const chartOptions: ChartOptions<'bar'> = useMemo(() => {
        return {
            indexAxis: 'y',
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        display: true,
                    },
                },
                y: {
                    ticks: {
                        display: true,
                        autoSkip: false,
                    },
                    barThickness: 30,
                },
            },
        };
    }, []);

    return { newsChartData, chartOptions };
}