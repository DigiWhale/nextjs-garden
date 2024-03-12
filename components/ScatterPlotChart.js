import React from 'react';
import Plot from 'react-plotly.js';

const ScatterPlotChart = ({ data, title }) => {
  const xValues = data.map((_, index) => index);

  return (
    <Plot
      data={[
        {
          x: xValues,
          y: data,
          mode: 'markers',
          type: 'scatter',
          marker: { color: 'blue' },
        },
      ]}
      layout={{
        title: title,
        xaxis: {
          title: 'Index',
        },
        yaxis: {
          title: 'Value',
          rangemode: 'tozero', // Adjust y-axis to include 0
        },
        width: 720,
        height: 400,
      }}
    />
  );
};

export default ScatterPlotChart;
