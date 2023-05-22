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

const yearDict: { [key: string]: string } = {
  "2002-01": "January",
  "2002-02": "February",
  "2002-03": "March",
  "2002-04": "April",
  "2002-05": "May",
  "2002-06": "June",
  "2002-07": "July",
  "2002-08": "August",
  "2002-09": "September",
  "2002-10": "October",
  "2002-11": "November",
  "2002-12": "December",
};

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Delay Analysis',
    },
  },
};

export function VerticalBarChart() {

  //useState constants
  const [activeData,setActiveData] = useState<any>([]);

 //redux hooks
 const chartDataStore = useSelector((state: any) => state.flight.chartData1);
 const selectedToggle = useSelector((state: any) => state.flight.selectedToggle);

 console.log('chart data store in bar chart',chartDataStore)
//functions
const handleGraphData = (data:any) => {
  console.log('data in handle graph data',data)
  //set labels as Object.keys(data) and parse to string according to yearDict as yearDict[year] and sort in ascending order
  // let yearDict: { [key: string]: boolean } = {};
  // Object.keys(data['year']).sort().forEach((key: string) => {
  //     yearDict[key] = data['year'][key];
  // }
  // );
  let labels = Object.keys(data).sort().map((key:string)=>yearDict[key]);
  console.log('labels',labels)
  let datasets:any = [];
  let color = selectedToggle==='arrival'? 'rgba(11,40,56,0.8)' : 'rgba(255, 155, 66, 0.8)';
  let borderColor = selectedToggle==='arrival'? 'rgba(173, 216, 230, 0.5)' : 'rgba(255, 192, 203, 0.5)';
  let borderWidth = 1;
  let dataset = {
    label:selectedToggle,
    //for each key ,console.log(key) set data as data['arrVal']/data['cnt'] if selectedToggle is arrival else data['depVal']/data['cnt'] parse to float and round to 2 decimal places
    data:Object.keys(data).map((key:string)=>selectedToggle==='arrival'? parseFloat((data[key]['arrVal']/data[key]['cnt']).toFixed(2)) : parseFloat((data[key]['depVal']/data[key]['cnt']).toFixed(2))),
    backgroundColor: color,
    borderColor: borderColor,
    borderWidth: borderWidth
  }
  datasets.push(dataset);
  let graphData = {
    labels:labels,
    datasets:datasets
  }
  return graphData;
}

 //useEffect hooks
 useEffect(()=>{
    let data = handleGraphData(chartDataStore['graph1'])
    setActiveData(data)
 },[chartDataStore, selectedToggle])

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