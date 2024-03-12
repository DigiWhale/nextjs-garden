import React from 'react';
import Plot from 'react-plotly.js';

const RainbowBarChart = ({ sensorData }) => {
    // Generate arrays for x (color names) and y (values)
    const xData = Object.keys(sensorData);
    const yData = Object.values(sensorData);

    return (
        <Plot
            data={[
                {
                    x: xData,
                    y: yData,
                    type: 'bar',
                    marker: {
                        color: [
                            'rgba(54, 162, 235, 0.6)',  // Blue
                            'rgba(75, 192, 192, 0.6)',  // Green
                            'rgba(255, 159, 64, 0.6)',  // Orange
                            'rgba(255, 99, 132, 0.6)',  // Red
                            'rgba(153, 102, 255, 0.6)', // Violet
                            'rgba(255, 205, 86, 0.6)',  // Yellow
                            // Add more colors as needed
                        ],
                    },
                },
            ]}
            layout={{
                width: 720,
                height: 400,
                title: 'Color Intensity',
                yaxis: {
                    title: 'Intensity',
                    rangemode: 'tozero',
                },
                xaxis: {
                    title: 'Color',
                },
            }}
        />
    );
};

export default RainbowBarChart;
