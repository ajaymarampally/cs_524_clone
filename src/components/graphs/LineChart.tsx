import React, { useState,useEffect,useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from "axios";
import ReactDOM from 'react-dom';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
interface AirportCode {
  iata_code: string;
  airport_name: string;
  delay_mode: string;
}

const LineChart = (props: AirportCode) => {
  const mode = props.delay_mode==='arrival'?'Arrival':'Departure';
  const [displayToggle, setDisplayToggle] = useState<boolean>(false);
  const [dynamicLabels, setDynamicLabels] = useState<string[]>([]);
  const [delay, setDelay] = useState<number[]>([]);
  const [taxi, setTaxi] = useState<number[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [iataParam, setIataParam] = useState<string>('');

  async function fetchData(mode: string, code: string) {
    try {
      let axios_url = '';
      mode === 'arrival' ? axios_url = '/.netlify/functions/proxy?iata_arrival=' + code : axios_url = '/.netlify/functions/proxy?iata_departure=' + code;
      const response = await axios.get(axios_url);

      if (response && response.data.length > 0) {
        const dynLabel: string[] = [];
        const tdelay: number[] = [];
        const ttaxi: number[] = [];

        response.data.forEach((element: any) => {
          if (element) {
            dynLabel.push(element.to_char);
            tdelay.push(element.delay);
            ttaxi.push(element.taxi);
          }
        });

        setDynamicLabels(dynLabel);
        setDelay(tdelay);
        setTaxi(ttaxi);

        if (dynLabel.length > 0) {
          setDisplayToggle(true);
        }
        else{
          setDisplayToggle(false);
        }
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    fetchData(props.delay_mode, props.iata_code);
  }, []);

  useEffect(() => {
    const chartData = {
      labels: dynamicLabels,
      datasets: [
        {
          label: 'Delay',
          data: delay,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(203, 66, 245, 0.5)',
        },
        {
          label: 'Taxi',
          data: taxi,
          borderColor: 'rgb(153, 120, 25)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };

    // Update the chart content using DOM manipulation
    if (chartRef.current) {
        const chartContainer = chartRef.current;
        chartContainer.innerHTML = ''; // Clear previous content
        ReactDOM.render(<Line options={options} data={chartData} />, chartContainer);
      }
  }, [displayToggle]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${mode} delay analysis for ${props.iata_code}`,
      },
    },
  };

  return (
    <>
      {displayToggle && <h4>{props.airport_name}</h4>}
      {displayToggle && <div id="chart_actual" ref={chartRef}> </div>}
    </>
  );
};

export default LineChart;