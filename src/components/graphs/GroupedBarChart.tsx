import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSelector } from "react-redux";
import stateMap from "../util/StateMap";
import { useEffect, useState } from "react";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Dataset {
    label: string;
    data: number[];
    backgroundColor: string;
  }
  
  interface DataObject {
    yearMonth: string;
    [key: string]: string | number;
  }

export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Chart.js Bar Chart - Stacked',
    },
  },
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};


const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => [2,3,4]),
      backgroundColor: 'rgb(255, 99, 132)',
      stack: 'Stack 0',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => [2,3,4]),
      backgroundColor: 'rgb(75, 192, 192)',
      stack: 'Stack 0',
    },
    {
      label: 'Dataset 3',
      data: labels.map(() => [2,3,4]),
      backgroundColor: 'rgb(53, 162, 235)',
      stack: 'Stack 1',
    },
  ],
};

export function GroupedBarChart() {

    const [graphData,setgraphData] = useState<any>({
    'arrival':[],
    'departure':[]
  });
  const [activeData,setActiveData] = useState<any>([]);
  //redux store
  const chartDataStore = useSelector((state: any) => state.flight.chartData1);
  const selectedToggle = useSelector((state: any) => state.flight.selectedToggle);

  function createDatasets(data: DataObject[]): Dataset[] {
    const labels: string[] = ["AA", "AS", "CO", "DL", "HP", "MQ", "NW", "UA", "US", "WN"];
    
    return data.map((obj: DataObject) => {
      const dataset: Dataset = {
        label: obj.yearMonth,
        data: labels.map((label: string) => Number(obj[label])),
        backgroundColor: getRandomColor()
      };
      
      return dataset;
    });
  }
  
  function getRandomColor(): string {
    const letters: string = "0123456789ABCDEF";
    let color: string = "#";
    for (let i: number = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  const handleGraphData = (data:any) =>{
    let labels = ["AA", "AS", "CO", "DL", "HP", "MQ","NW","UA","US","WN"]
    let datasets = createDatasets(data)

    data = {
        labels,
        datasets
    }
    
    return data;
   
    
  }

useEffect(() => {
  console.log('chart data store in bar chart', chartDataStore, Object.keys(chartDataStore).length);

  if (Object.keys(chartDataStore).length > 0) {
    let chartData: { [key: string]: { yearMonth: string; [key: string]: number | string }[] } = {
      'arrival': [],
      'departure': []
    };

    Object.keys(chartDataStore).map((month) => {
      console.log('month', month);
      chartData['arrival'].push({ yearMonth: month });
      chartData['departure'].push({ yearMonth: month });

      Object.keys(chartDataStore[month]).map((airline) => {
        chartData['arrival'][chartData['arrival'].length - 1][airline] = chartDataStore[month][airline]['arrDelay'];
        chartData['departure'][chartData['departure'].length - 1][airline] = chartDataStore[month][airline]['depDelay'];
      });
    });

    console.log('after parse chartdata', chartData);
    setgraphData(chartData);
  }
}, [chartDataStore]);




 useEffect(()=>{
  console.log('selected toggle in bar chart',selectedToggle)
  if(Object.keys(chartDataStore).length > 0 && selectedToggle==='arrival'){
    let data = handleGraphData(graphData['arrival'])    
    setActiveData(data)
  }
  else if(Object.keys(chartDataStore).length > 0 && selectedToggle==='departure'){
    let data = handleGraphData(graphData['departure'])
    setActiveData(data)
  }
 },[selectedToggle,graphData])

 useEffect(()=>{
  console.log('active data',activeData)
 },[activeData])
 
 if(Object.keys(activeData).length > 0 ){
    return(
        <Bar options={options} data={activeData} />
    )
 }
 else{
    return(
        <div>
            Loading...
        </div>
    )
 }
}
