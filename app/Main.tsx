'use client'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import VideoPlayer from '../components/VideoPlayer'; // Make sure the path is correct

const RainbowBarChart = dynamic(() => import('../components/RainbowBarChart'), {
  ssr: false,
});
const ScatterPlotChart = dynamic(() => import('../components/ScatterPlotChart'), {
  ssr: false,
});
const MultiLineGraph = dynamic(() => import('../components/MultiLineGraph'), {
  ssr: false,
});
const LuxTimeSeries = dynamic(() => import('../components/LuxTimeSeries'), {
  ssr: false,
});
const TdsTimeSeries = dynamic(() => import('../components/TdsTimeSeries'), {
  ssr: false,
});
const SpectralTimeSeries = dynamic(() => import('../components/SpectralTimeSeries'), {
  ssr: false,
});

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  const [gardenData, setGardenData] = useState(null);
  const [sensorData, setSensorData] = useState([]); // State to hold the fetched data
  const [rainbowData, setRainbowData] = useState({}); // State to hold the fetched data
  const [colorsData, setColorsData] = useState({}); // State to hold the fetched data

  useEffect(() => {
    const socket = io('http://gardenpi.local:3001', {
      transports: ['websocket']
    });

    socket.on('garden_data', (data) => {
      const parsedData = JSON.parse(data);
      setGardenData(parsedData);
      setRainbowData({"blue": Math.round(parsedData.blue), "green": Math.round(parsedData.green), "orange": Math.round(parsedData.orange), "red": Math.round(parsedData.red), "violet": Math.round(parsedData.violet), "yellow": Math.round(parsedData.yellow)});
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Define an async function to fetch data
    const fetchData = async () => {
      try {
        // Adjust the URL to match your endpoint for fetching TDS data
        const response = await fetch('http://gardenpi.local:3001/data/all');
        if (!response.ok) {
          // If the HTTP response status code is not OK, throw an error
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON response body
        setSensorData(data); // Update the state with the fetched data
        for (let key in data) {
          if (["blue", "green", "orange", "red", "violet", "yellow"].includes(key)) {
            setColorsData(prevColorsData => ({...prevColorsData, [key]: data[key]}));
          }
        }
      } catch (error) {
        // Log any errors that occur during the fetch operation
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData(); // Call fetchData to fetch the data when the component mounts
  }, []); // Empty dependency array means this effect runs only once on mount


  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Sensors
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              <li className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        {/* <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time> */}
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <TdsTimeSeries />
                    </div>
                  </div>
                </article>
              </li>

        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
