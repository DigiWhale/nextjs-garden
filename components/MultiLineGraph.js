import React from 'react';
import Plot from 'react-plotly.js';

// Predefined colors for known keys
const colorMap = {
  blue: 'rgba(54, 162, 235, 0.6)',
  green: 'rgba(75, 192, 192, 0.6)',
  orange: 'rgba(255, 159, 64, 0.6)',
  red: 'rgba(255, 99, 132, 0.6)',
  violet: 'rgba(153, 102, 255, 0.6)',
  yellow: 'rgba(255, 205, 86, 0.6)',
};

// Function to generate a random color
const getRandomColor = () => {
  const o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',0.6)';
};

const MultiLineGraph = ({ dataDict, title }) => {
  // Transform dataDict into Plotly's data format
  const plotData = Object.keys(dataDict).map(key => {
    const color = colorMap[key] || getRandomColor(); // Use predefined color or generate a random one
    return {
      x: dataDict[key].map((_, index) => index), // Create an array [0, 1, 2, ...] for the x-axis
      y: dataDict[key], // The values for the y-axis
      type: 'scatter', // Specify the chart type
      mode: 'lines+markers', // Display both lines and markers
      name: key, // Use the dictionary key as the line name
      line: { color }, // Set the line color
    };
  });

  return (
    <Plot
      data={plotData}
      layout={{
        width: 720,
        height: 440,
        title: title,
        xaxis: {
          title: 'Index',
        },
        yaxis: {
          title: 'Value',
        },
      }}
    />
  );
};

export default MultiLineGraph;
