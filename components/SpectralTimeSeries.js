import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

const SpectralTimeSeries = () => {
    const [plotData, setPlotData] = useState([]);
    const [times, setTimes] = useState([]);

    // Predefined colors for specific columns
    const colorMap = {
        Red: 'rgba(255, 0, 0, 0.6)',
        Green: 'rgba(0, 255, 0, 0.6)',
        Blue: 'rgba(0, 0, 255, 0.6)',
        Violet: 'rgba(238, 130, 238, 0.6)',
        Yellow: 'rgba(255, 255, 0, 0.6)',
        Orange: 'rgba(255, 165, 0, 0.6)',
        // Add more mappings as needed
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://gardenpi.local:3001/csv/spectral_readings.csv'); // Adjust the path as necessary
            const text = await response.text();
            // Use PapaParse to convert CSV text to JSON
            Papa.parse(text, {
                header: true, // Assumes first row in CSV contains column names
                dynamicTyping: true, // Automatically convert numeric strings to numbers
                complete: (results) => {
                    const parsedData = results.data;
                    const newTimes = parsedData.map(row => row["Timestamp"]); // Assuming a "Timestamp" column exists
                    setTimes(newTimes);
                    
                    // Identify all columns except "Timestamp"
                    const columns = Object.keys(parsedData[0]).filter(key => key !== "Timestamp");
                    
                    // Generate plot data for each column
                    const newData = columns.map(column => ({
                        x: newTimes,
                        y: parsedData.map(row => row[column]),
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: column, // Use column name as trace name
                        marker: {color: colorMap[column] || 'rgba(0,0,0,0.6)'}, // Default to black if no match
                        line: {color: colorMap[column] || 'rgba(0,0,0,0.6)'},
                    }));
                    
                    setPlotData(newData);
                }
            });
        };
        fetchData();
    }, []);

    return (
        <Plot
            data={plotData}
            layout={{
                width: 720, 
                height: 440, 
                title: 'Spectral Time Series',
                xaxis: {
                    title: 'Timestamp',
                },
                yaxis: {
                    title: 'Value',
                    rangemode: 'tozero',
                }
            }}
        />
    );
};

export default SpectralTimeSeries;
