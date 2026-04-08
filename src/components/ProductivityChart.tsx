import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTaskStore } from '../store';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

export const ProductivityChart: React.FC = () => {
    const weeklyStats = useTaskStore((s) => s.weeklyStats);
    const theme = useTaskStore((s) => s.theme);

    if (weeklyStats.length === 0) return null;

    const hasData = weeklyStats.some((d) => d.total > 0);
    if (!hasData) return null;

    const isDark = theme === 'dark';
    const textColor = isDark ? '#e8e9ed' : '#1a1d23';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    const labels = weeklyStats.map((d) => {
        const dt = new Date(d.date + 'T00:00:00');
        return dt.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    });

    const data = {
        labels,
        datasets: [
            {
                label: 'Total Tasks',
                data: weeklyStats.map((d) => d.total),
                backgroundColor: isDark ? 'rgba(139,131,255,0.5)' : 'rgba(108,99,255,0.5)',
                borderColor: isDark ? '#8b83ff' : '#6c63ff',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'Completed',
                data: weeklyStats.map((d) => d.completed),
                backgroundColor: isDark ? 'rgba(52,211,153,0.5)' : 'rgba(34,197,94,0.5)',
                borderColor: isDark ? '#34d399' : '#22c55e',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    padding: 16,
                    font: { size: 12 },
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#252836' : '#ffffff',
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: isDark ? '#2d3040' : '#e2e5ea',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10,
            },
        },
        scales: {
            x: {
                ticks: { color: textColor, font: { size: 11 } },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColor,
                    font: { size: 11 },
                    stepSize: 1,
                    precision: 0,
                },
                grid: { color: gridColor },
            },
        },
    };

    return (
        <div className="chart-container">
            <h3 className="chart-container__title">Weekly Productivity</h3>
            <div className="chart-container__canvas">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};
