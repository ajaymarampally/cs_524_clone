import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reduxRoot';
import * as d3 from 'd3';



function LegendComponent() {

  //redux hooks
  const legendStore = useSelector((state: RootState) => state.flight.selectedLegend);
  const legendMinMax = useSelector((state: RootState) => state.flight.LegendMinMax);
  const legendColorScale = useSelector((state: RootState) => state.flight.colorScale);
  console.log('legendMinMax ',legendMinMax)
    console.log('legendColorScale ',legendColorScale)
  //ARRIVAL --> colorScale = rgba(0, 0, 255, 0.5), rgba(173, 216, 230, 0.5);
  //DEPARTURE --> colorScale = rgba(139, 0, 0, 0.5), rgba(255, 192, 203, 0.5);
 
  const drawLegend = (legendTitle:string) => {
    //clear the container
    d3.select("#legend__populate").selectAll("*").remove();

    let LlegendMinMax = legendMinMax;
    console.log('colorScale ',legendColorScale)

    const legendSvg = d3.select("#legend__populate")
    .append("svg")
    .attr("width", 200)
    .attr("height", 50);

    const gradient = legendSvg.append("defs")
    .append("linearGradient")
    .attr("id", "color-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

    gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", legendColorScale(LlegendMinMax[0]))
    .attr("stop-opacity", 1);

    gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", legendColorScale(LlegendMinMax[1]))
    .attr("stop-opacity", 1);


    legendSvg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 200)
    .attr("height", 20)
    .attr("fill", "url(#color-gradient)");

    legendSvg.append("text")
    .attr("x", 0)
    .attr("y", 35)
    .attr("text-anchor", "start")
    .text(Math.round(LlegendMinMax[0]));

    legendSvg.append("text")
    .attr("x", 200)
    .attr("y", 35)
    .attr("text-anchor", "end")
    .text(Math.round(LlegendMinMax[1]));
}

    React.useEffect(() => {
        console.log('legendColorScale ',legendColorScale)
        if(legendColorScale!=null)
        {
            drawLegend(legendStore);
        }
    }, [legendColorScale,legendStore])


  return (
    <>
        <div id='legend__populate'>

        </div>
    </>
    )
}

export default LegendComponent