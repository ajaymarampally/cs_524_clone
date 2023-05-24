// yarn add @nivo/core @nivo/bar
import { ResponsiveBar } from "@nivo/bar";
import { useSelector } from "react-redux";
import stateMap from "../util/StateMap";
import { useEffect, useState } from "react";

/*

bar chart data -->

*/

const data = [
  {
    country: "AD",
    "hot dog": 20,
    "hot dogColor": "hsl(310, 70%, 50%)",
    burger: 120,
    burgerColor: "hsl(196, 70%, 50%)",
    sandwich: 57,
    sandwichColor: "hsl(184, 70%, 50%)",
    kebab: 67,
    kebabColor: "hsl(116, 70%, 50%)",
    fries: 150,
    friesColor: "hsl(292, 70%, 50%)",
    donut: 6,
    donutColor: "hsl(117, 70%, 50%)",
  },
  {
    country: "AE",
    "hot dog": 48,
    "hot dogColor": "hsl(267, 70%, 50%)",
    burger: 163,
    burgerColor: "hsl(78, 70%, 50%)",
    sandwich: 124,
    sandwichColor: "hsl(257, 70%, 50%)",
    kebab: 174,
    kebabColor: "hsl(316, 70%, 50%)",
    fries: 115,
    friesColor: "hsl(353, 70%, 50%)",
    donut: 126,
    donutColor: "hsl(35, 70%, 50%)",
  },
  {
    country: "AF",
    "hot dog": 129,
    "hot dogColor": "hsl(229, 70%, 50%)",
    burger: 176,
    burgerColor: "hsl(250, 70%, 50%)",
    sandwich: 172,
    sandwichColor: "hsl(28, 70%, 50%)",
    kebab: 187,
    kebabColor: "hsl(274, 70%, 50%)",
    fries: 57,
    friesColor: "hsl(9, 70%, 50%)",
    donut: 144,
    donutColor: "hsl(9, 70%, 50%)",
  },
  {
    country: "AG",
    "hot dog": 17,
    "hot dogColor": "hsl(296, 70%, 50%)",
    burger: 118,
    burgerColor: "hsl(159, 70%, 50%)",
    sandwich: 20,
    sandwichColor: "hsl(302, 70%, 50%)",
    kebab: 91,
    kebabColor: "hsl(151, 70%, 50%)",
    fries: 159,
    friesColor: "hsl(1, 70%, 50%)",
    donut: 169,
    donutColor: "hsl(290, 70%, 50%)",
  },
  {
    country: "AI",
    "hot dog": 190,
    "hot dogColor": "hsl(211, 70%, 50%)",
    burger: 5,
    burgerColor: "hsl(38, 70%, 50%)",
    sandwich: 148,
    sandwichColor: "hsl(333, 70%, 50%)",
    kebab: 95,
    kebabColor: "hsl(192, 70%, 50%)",
    fries: 4,
    friesColor: "hsl(347, 70%, 50%)",
    donut: 162,
    donutColor: "hsl(48, 70%, 50%)",
  },
  {
    country: "AL",
    "hot dog": 35,
    "hot dogColor": "hsl(248, 70%, 50%)",
    burger: 162,
    burgerColor: "hsl(186, 70%, 50%)",
    sandwich: 43,
    sandwichColor: "hsl(337, 70%, 50%)",
    kebab: 193,
    kebabColor: "hsl(105, 70%, 50%)",
    fries: 25,
    friesColor: "hsl(1, 70%, 50%)",
    donut: 92,
    donutColor: "hsl(110, 70%, 50%)",
  },
  {
    country: "AM",
    "hot dog": 59,
    "hot dogColor": "hsl(36, 70%, 50%)",
    burger: 138,
    burgerColor: "hsl(275, 70%, 50%)",
    sandwich: 197,
    sandwichColor: "hsl(264, 70%, 50%)",
    kebab: 5,
    kebabColor: "hsl(172, 70%, 50%)",
    fries: 41,
    friesColor: "hsl(46, 70%, 50%)",
    donut: 131,
    donutColor: "hsl(340, 70%, 50%)",
  },
];

function MyResponsiveBar() {
  //useState hooks

  const [keys, setKeys] = useState<any>([]);
  const [indexBy, setIndexBy] = useState<string>("");
  const [yearArr, setYearArr] = useState<any>([]);
  const [yearAvg, setYearAvg] = useState<any>({});
  const [graphData,setgraphData] = useState<any>({
    'arrival':[],
    'departure':[]
  });
  const [activeData,setActiveData] = useState<any>([]);
  //redux store
  const chartDataStore = useSelector((state: any) => state.flight.chartData1);
  //const regionDelayData = useSelector((state: any) => state.flight.regionDelayData);
  //const selectedState = useSelector((state: any) => state.flight.selectedState);
  const selectedToggle = useSelector((state: any) => state.flight.selectedToggle);


  const colorsArr = [
    "hsl(310, 70%, 50%)",
    "hsl(196, 70%, 50%)",
    "hsl(184, 70%, 50%)",
    "hsl(116, 70%, 50%)",
    "hsl(292, 70%, 50%)",
    "hsl(117, 70%, 50%)",
    "hsl(267, 70%, 50%)",
    "hsl(78, 70%, 50%)",
    "hsl(257, 70%, 50%)",
    "hsl(316, 70%, 50%)"
  ]


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

const generateYear = (data: any) => {
    let yearSet = new Set();
    Object.keys(data).forEach((year: string) => {
        yearSet.add(year);
    });
    let yearList = Array.from(yearSet).sort();
    return yearList;
}

const generateYearAvg = (data: any) => {
    let yearAvg:any = {};
    let selectedFilter = selectedToggle==='arrival'? 'arr_delay' : 'dep_delay';
    Object.keys(data).forEach((year: string) => {
        let sum = 0;
        let count = 0;
        Object.keys(data[year]).forEach((carrier: string) => {
            Object.keys(data[year][carrier]).forEach((size: string) => {
                sum+= parseFloat(data[year][carrier][size][selectedFilter]);
                count++;
            });
        });
        yearAvg[year] = sum/count;
    });
    return yearAvg;
}

const generateData = (data: any) => {
    /*
       takes regionDelayData
        for each year in yearArr
        create a dictionary
        {
            year:year,
            for each carrier in regionDelayData[year]
            carrier: regionDelayData[year][carrier]

        }

    */
   let dataArr = [];

}


useEffect(() => {

  if (Object.keys(chartDataStore).length > 0) {
    let chartData: { [key: string]: { yearMonth: string; [key: string]: number | string }[] } = {
      'arrival': [],
      'departure': []
    };

    Object.keys(chartDataStore).map((month) => {
      chartData['arrival'].push({ yearMonth: month });
      chartData['departure'].push({ yearMonth: month });

      Object.keys(chartDataStore[month]).map((airline) => {
        chartData['arrival'][chartData['arrival'].length - 1][airline] = chartDataStore[month][airline]['arrDelay'];
        chartData['departure'][chartData['departure'].length - 1][airline] = chartDataStore[month][airline]['depDelay'];
      });
    });

    setgraphData(chartData);
  }
}, [chartDataStore]);




 useEffect(()=>{

  if(Object.keys(chartDataStore).length > 0 && selectedToggle==='arrival'){
    setActiveData(graphData['arrival'])
  }
  else if(Object.keys(chartDataStore).length > 0 && selectedToggle==='departure'){
    setActiveData(graphData['departure'])
  }
 },[selectedToggle,graphData])

 useEffect(()=>{
  //console.log('active data',activeData)
 },[activeData])

  return (
    <>
      <ResponsiveBar
        data={data}
        keys={["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]}
        indexBy="country"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "nivo" }}
        theme={{
            textColor: "white",
            axis: {
              ticks: {
                text: {
                  fill: "white"
                }
              }
            }
        }}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "#38bcb2",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "#eed312",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        fill={[
          {
            match: {
              id: "fries",
            },
            id: "dots",
          },
          {
            match: {
              id: "sandwich",
            },
            id: "lines",
          },
        ]}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "country",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "food",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role="application"
        ariaLabel="Flight Bar Chart"
        barAriaLabel={function (e) {
          return (
            e.id + ": " + e.formattedValue + " in country: " + e.indexValue
          );
        }}
      />
    </>
  );
}
export default MyResponsiveBar;
