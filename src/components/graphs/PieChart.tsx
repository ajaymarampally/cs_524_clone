import { ResponsivePie } from '@nivo/pie'
import { useSelector } from "react-redux";
import stateMap from "../util/StateMap";
import { useEffect, useState } from "react";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

interface PieData {
    id: string;
    label: string;
    value: number;
    color: string;
  }

  interface MyResponsivePieProps {
    data: PieData[];
  }

export default function MyResponsivePie() {
     //useState constants
     const [graphData,setgraphData] = useState<any>({
        'arrival':[],
        'departure':[]
      });
      const [activeData,setActiveData] = useState<any>([]);

      const chartDataStore = useSelector((state: any) => state.flight.chartData1);
      const selectedToggle = useSelector((state: any) => state.flight.selectedToggle);

      const colorMap:any = {
        'AA':'#2b67c1',
        'AS':'#2b67c1',
        'CO':'#2b67c1',
        'DL':'#2b67c1',
        'HP':'#2b67c1',
        'MQ':'#2b67c1',
        'NW':'#2b67c1',
        'UA':'#2b67c1',
        'US':'#2b67c1',
        'WN':'#2b67c1'
    }

      //functions

        const handleGraphData = (data:any) =>{
            /*
                let pie_data = []
                create a new object in the pie_data array for every airline in the data object
                set the object as
                {
                    id:airline,
                    label:airline,
                    value: if selectedToggle is arrival then data[airline]['arrVal']/data[airline]['cnt'] else data[airline]['depVal']/data[airline]['cnt'],
                    color: set color according to colorMap
                }
            */
              let pie_data: { id: string; label: string; value: number; color: any; }[] = []
                Object.keys(data).map((airline:string)=>{
                    pie_data.push({
                        id:airline,
                        label:airline,
                        value:selectedToggle==='arrival'? Math.abs(parseFloat((data[airline]['arrVal']/data[airline]['cnt']).toFixed(2))) : Math.abs(parseFloat((data[airline]['depVal']/data[airline]['cnt']).toFixed(2))),
                        color:colorMap[airline]
                    })
                }
                )
                return pie_data;


        }


     //useEffect hooks
 useEffect(()=>{
      let data = handleGraphData(chartDataStore['graph2'])
      setActiveData(data)
   },[selectedToggle, graphData, chartDataStore])

   if(Object.keys(activeData).length > 0 ){
      return(
        <ResponsivePie
        data={activeData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.2
                ]
            ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    2
                ]
            ]
        }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        fill={
            [
                {
                    match: {
                        id: 'AA'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'AS'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'CO'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'DL'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'HP'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'MQ'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'NW'
                    },
                    id: 'lines'
                },
                {
                    match: {
                        id: 'UA'
                    },
                    id: 'lines'
                },
                {
                    match: {
                        id: 'US'
                    },
                    id: 'lines'
                },
                {
                    match: {
                        id: 'WN'
                    },
                    id: 'lines'
                }
            ]
        }
        legends={[
            {
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 22,
                itemWidth: 100,
                itemHeight: 10,
                itemTextColor: '#999',
                itemDirection: 'top-to-bottom',
                itemOpacity: 1,
                symbolSize: 10,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />
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

