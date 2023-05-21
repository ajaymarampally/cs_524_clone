import { useRef, useEffect, useState, MutableRefObject } from 'react';
import Chart from 'chart.js/auto';
import { useSelector } from 'react-redux';

const StackedBarChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef: MutableRefObject<Chart<"bar", (number | [number, number] | null)[], unknown> | null> = { current: null };
  const [chartData, setChartData] = useState<any>({});
  const [chartLabels, setChartLabels] = useState<any>([]);
  const [chartDatasets, setChartDatasets] = useState<any>([]);
  //get chart data from redux 

  const chartDataStore = useSelector((state: any) => state.flight.chartData1);

  useEffect(() => {
    console.log('Yash : ',chartDataStore);
    setChartData(chartDataStore);
    let labels = sortData(chartDataStore);
    setChartLabels(labels);
  }, [chartDataStore]);

  useEffect(() => {
    console.log('chartData', chartData);
  }, [chartData]);


  useEffect(() => {
    console.log('chartLabels', chartLabels);
    const data = (getDataSetChart(chartData, chartLabels));
    setChartDatasets(data);
    //destroy chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

  }, [chartLabels]);


  const sortData = (data: any) => {
    let labelSet = new Set();
    Object.keys(data).forEach((size: string) => {
      Object.keys(data[size]).forEach((year: string) => { 
        labelSet.add(year);
      });
    });
    let labelList = Array.from(labelSet).sort();  
    return labelList;
  }

  const getData = (sizeObj:any,labelList:any) =>{
    let data:any = [];
    Object.keys(labelList).forEach((year:string)=>{
      if(sizeObj[labelList[year]] !== null){
        data.push(sizeObj[labelList[year]]);
      }
      else{
        data.push(0);
      }
    });
    return data;
  }

  const getDataSetChart = (MainObj:any,labelList:any)=>{
    let dataset:any = [];
    Object.keys(MainObj).forEach((size:string)=>{
      let data = getData(MainObj[size],labelList);
      dataset.push({
        label:size,
        data:data,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      });
    });
    return dataset;
  }

  useEffect(() => {

    const labelList = sortData(chartDataStore);
    //set chartData as getDataSetChart(chartData, labelList)
    const data = (getDataSetChart(chartData, labelList));
    console.log('data', data);

    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const myChart = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: labelList,
          datasets: data
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Chart.js Bar Chart - Stacked'
            },
          },
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true
            }
          }
        }
      });
      chartInstanceRef.current = myChart;
    }
  }, [chartDatasets]);

  //clear all chart instances
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    }
  }, []);
  

  return (
    <>
      {chartDatasets && (
        <canvas ref={chartRef} />
      )}
    </>
  )

 
};

export default StackedBarChart;
