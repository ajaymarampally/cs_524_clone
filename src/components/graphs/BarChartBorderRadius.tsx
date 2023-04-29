import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

function BarChartBorderRadius() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef<Chart<"bar", number[], string> | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: ['Group A', 'Group B', 'Group C', 'Group D'],
          datasets: [
            {
              label: 'Dataset 1',
              data: [10, 20, 30, 40],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              borderRadius: 10 // set the border radius for each bar
            },
            {
              label: 'Dataset 2',
              data: [20, 30, 40, 50],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              borderRadius: 10 // set the border radius for each bar
            },
            {
              label: 'Dataset 3',
              data: [30, 40, 50, 60],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
              borderRadius: 10 // set the border radius for each bar
            }
          ]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Chart.js Bar Chart with Border Radius'
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
    }
  }, [chartRef]);

  return (
    <div>
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default BarChartBorderRadius;
