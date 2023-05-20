import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import SearchBar from "./SearchBar";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import { Projection, useGeographic } from "ol/proj";
import Overlay from "ol/Overlay";
import FilterComponent from "./FilterComponent";
import { Circle, LineString } from "ol/geom";
import Feature, { FeatureLike } from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import * as d3 from "d3";
import { scaleSequential } from "d3-scale";
import { interpolateRdBu } from "d3-scale-chromatic";
import AnalyticsComponent from "./AnalyticsComponent";
import SelectInteraction from 'ol/interaction/Select';
import axios from "axios";
import { GeoJSON } from 'ol/format';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import FilterPropsComponent from "./FilterProps";
import { OSM, Source } from 'ol/source';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reduxRoot";
import LegendComponent from "./LegendComponent";
import stateMap from "./util/StateMap";
import { flight_actions } from "../redux/slices/flightSlice";
import MainFilter from "./MainFilter";
import StackedBarChart from "./graphs/StackedBarChart";
import BarChartBorderRadius from "./graphs/BarChartBorderRadius";
import menu from "../img/menu.png";
import PieChart from "./graphs/PieChart";
import { pointerMove } from "ol/events/condition";
import CircleStyle from "ol/style/Circle";
import {fromLonLat} from 'ol/proj';
import Point from 'ol/geom/Point';
import location from "../img/location-pin.png";
import { Pixel } from "ol/pixel";
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Layer from "ol/renderer/Layer";
import { features } from "process";
import BarChart from "./graphs/BarChart";

//d3.interpolateRgb.gamma(2.2)("red", "blue")(0.5)

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
}));

function MapComponent() {

  //constants
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const map = useRef<Map>();
  const classes = useStyles();
  const [airportLocation, setAirportLocation] = useState<number[] | null>(null);
  const [airportCode, setAirportCode] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [airportInfo, setAirportInfo] = useState<any>(null);
  const [airportName, setAirportName] = useState<string>('');
  const [regionDelayData, setRegionDelayData] = useState<any>({});
  const [chartData1, setChartData1] = useState<any>(null);
  const [consolidatedChartData, setConsolidatedChartData] = useState<any>(null);
  const [showGraphs, setShowGraphs] = useState<boolean>(false);
  const [SelectedState, setSelectedState] = useState<any>(null);
  const [averageDelayArrival, setAverageDelayArrival] = useState<{[key:string]:number}>({});
  const [averageDelayDeparture, setAverageDelayDeparture] = useState<{[key:string]:number}>({});

  //colorscaleProps of type d3.scaleSequential(d3.interpolateRgb("rgba(139, 0, 0, 0.5)", "rgba(255, 192, 203, 0.5)")).domain([min, max])

  const [colorScaleProps, setColorScaleProps] = useState<any>(null);

  useGeographic();

  //redux init
  const dispatch = useDispatch();
  const mapStore = useSelector((state: RootState) => state);
  const selectedToggle = mapStore.flight.selectedToggle;
  const selectedFiltersStore = mapStore.flight.selectedFilters;
  const regionalDataStore = mapStore.flight.regionDelayData;
  const colorScaleMinMaxStore = mapStore.flight.LegendMinMax;


  const [selectedFilters, setSelectedFilters] = React.useState<{[key: string]: string[]}>({
    "state": [],
    "year": [],
    "size": [],
    "carrier": [],
    "direction": [],
});

  const [globalFilter, setGlobalFilter] = React.useState<any>({
    "state": {},
    "year": {},
    "size": {},
    "carrier": {},
    "direction": {"departures": true, "arrival": false},
  });


  const pie_data = [
    {
      "id": "make",
      "label": "make",
      "value": 410,
      "color": "hsl(60, 70%, 50%)"
    },
    {
      "id": "elixir",
      "label": "elixir",
      "value": 470,
      "color": "hsl(318, 70%, 50%)"
    },
    {
      "id": "go",
      "label": "go",
      "value": 295,
      "color": "hsl(201, 70%, 50%)"
    },
    {
      "id": "c",
      "label": "c",
      "value": 529,
      "color": "hsl(212, 70%, 50%)"
    },
    {
      "id": "lisp",
      "label": "lisp",
      "value": 327,
      "color": "hsl(114, 70%, 50%)"
    }
  ]



  //useEffect
  useEffect(() => {
    //console.log("global filter map component", globalFilter);
    dispatch(flight_actions.set_flight_filters(globalFilter));
  }, [globalFilter]);


  const handleFilterClick = () =>{
    setShowGraphs(!showGraphs);
  }

  //functions
  async function parseData(newJsonData:any, regionDelayTree:any) {
    const newTree = Object.assign({}, regionDelayTree);
    let minArrDelay = 999999999999;
    let maxArrDelay = -999999999999;
    let minDepDelay = 999999999999;
    let maxDepDelay = -999999999999;

//     const newGlobalFilter: { [key: string]: object } = {
//       "state": {},
//       "year": {},
//       "size": {},
//       "carrier": {},
// //      "direction": {"departures": true, "arrival": false},
//     }

    newJsonData.forEach((item:any) => {
        const { iso_region, year_month, unique_carrier, size ,delay_type,delay} = item;
        if (!newTree[iso_region]) {
            newTree[iso_region] = {};
        }
        if (!newTree[iso_region][year_month]) {
            newTree[iso_region][year_month] = {};
        }
        if (!newTree[iso_region][year_month][unique_carrier]) {
            newTree[iso_region][year_month][unique_carrier] = {};
        }
        if (!newTree[iso_region][year_month][unique_carrier][size]) {
            newTree[iso_region][year_month][unique_carrier][size] = {};
        }
        if(delay_type==='arr'){
            newTree[iso_region][year_month][unique_carrier][size]['arr_delay'] = delay;
            minArrDelay = Math.min(minArrDelay, delay);
            maxArrDelay = Math.max(maxArrDelay, delay);
        }
        if(delay_type==='dep'){
            newTree[iso_region][year_month][unique_carrier][size]['dep_delay'] = delay;
            minDepDelay = Math.min(minDepDelay, delay);
            maxDepDelay = Math.max(maxDepDelay, delay);
        }

        // newGlobalFilter['state'][iso_region] = true;
        // newGlobalFilter['year'][year_month] = true;
        // newGlobalFilter['size'][size] = true;
        // newGlobalFilter['carrier'][unique_carrier] = true;

        setGlobalFilter((prevState:any) => {
          return {
            ...prevState,
            state: {
              ...prevState.state,
              [iso_region]: true
            },
            year: {
              ...prevState.year,
              [year_month]: true
            },
            size: {
              ...prevState.size,
              [size]: true
            },
            carrier: {
              ...prevState.carrier,
              [unique_carrier]: true
            },
          }
        });
    });
    //console.log(newGlobalFilter)
    setRegionDelayData(newTree);

  }

  function rgbToHex(rgb: string) {
    // Extract the three RGB values from the string
    const [r, g, b] = rgb.match(/\d+/g)?.map(Number) || [];

    // Convert the RGB values to hex code
    const hex = ((r << 16) | (g << 8) | b).toString(16);

    // Pad the hex code with zeros if necessary
    return "#" + hex.padStart(6, "0");
  }

  const drawStateColor = (state: string , value : string) => {
    // url for usa states geojson
    //console.log('state',state,'value',value)

    //clear all previous layers
    map.current?.getLayers().forEach((layer) => {
      if (layer instanceof VectorLayer) {
        map.current?.removeLayer(layer);
      }
    });


    const url = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
    // fetch the states geojson
    fetch(url)
      .then((response) => response.json())
      .then((geojson) => {
        const statesToDraw = geojson.features.filter((feature: any) => {
          const stateName = feature.properties.name;
          // add a color property to each feature
          feature.color = value;
          // return only the state where stateName matches the state we want to draw
          return stateName === state;
        });
        //console.log('statesToDraw',statesToDraw)
        // create a vector source using the modified geojson
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures({
            type: "FeatureCollection",
            features: statesToDraw,
          }),
        });
        // create a vector layer for the states
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: function (feature) {
            return new Style({
              fill: new Fill({
                //include 60% opacity , value is in the format rgb(a,b,c)
                color: value,
              }),
            });
          },
        });
        vectorLayer.setZIndex(0);
        // add the vector layer to the map
        map.current?.addLayer(vectorLayer);
      });
  };

  const setMapLocation = (search: string) => {
    setShowAnalytics(false);
    setIsLoading(true);
    setAirportCode(search.trim().toUpperCase());

    const [lon, lat] = getLonLat(search);

    if (mapRef.current) {
      const mapView = map.current?.getView();

      // Define the zoom levels and durations for the animations
      const zoomOutDuration = 2000;
      const zoomInDuration = 2000;

      // Zoom out gradually before zooming in to the new location
      mapView?.animate(
        {
          zoom: 4,
          duration: zoomOutDuration,
        },
        () => {
          mapView?.animate({
            center: [lon, lat],
            zoom: 12,
            duration: zoomInDuration,
          });
        }
      );

      // Set the airport location after the map has been moved
      setTimeout(() => {
        setAirportLocation([lon, lat]);
        setShowAnalytics(true);
      }, zoomOutDuration + zoomInDuration);


    }
  };

  const getLonLat = (search: string) => {

    //find the airport code in the airportInfo object based on airportInfo.iata_code
    const airport = airportInfo.find((airport:any) => {
      return airport.iata_code === search.trim().toUpperCase();
    });

    if(!airport){
      alert("Please enter a valid airport code");
      return [NaN, NaN];
    }
    setAirportName(airport.name);
    setAirportCode(airport.iata_code);
    return [airport.longitude, airport.latitude]
  };

  //function to make chartData
  const buildChartData1 = (state:string,year:string,carrier:string,size:string,delay:number) =>{
    console.log('chartData1',chartData1)
    if(!chartData1.hasOwnProperty(size) || !chartData1[size].hasOwnProperty(year)) {
      setChartData1((prevState:any) => {
        return {
          ...prevState,
          [size]: {
            ...prevState[size],
            [year]: [0, 0]
          }
        }
      });
    }

    //chartData1[size][year][0] += delay;
    //chartData1[size][year][1] += 1;

    setChartData1((prevState:any) => {
      const prevSize = prevState.hasOwnProperty(size) ? prevState[size] : {};
      return {
        ...prevState,
        [size]: {
          ...prevSize,
          [year]: [prevSize.hasOwnProperty(year) ? prevSize[year][0] + delay : delay, prevSize.hasOwnProperty(year) ? prevSize[year][1] + 1 : 1]
        }
      }
    });
  }

  const consolidateChartData = (chartData:any) =>{
    let newChartData:any = {};
    Object.keys(chartData).forEach((size) => {
      newChartData[size] = {};
      Object.keys(chartData[size]).forEach((year) => {
        newChartData[size][year] = chartData[size][year][0]/chartData[size][year][1];
      });
    });
    return newChartData;

  }

  const showTooltip = (data: any) => {
    // Get reference to the tooltip container element
    const tooltipContainer = document.getElementById('tooltip__container');
    //set the z-index of the tooltip container to 1 to show it
    tooltipContainer?.style.setProperty('z-index', '1');

    //change the className from d-none to d-block to show the tooltip
    tooltipContainer?.classList.remove('d-none');

    // Update the class of the tooltip container to show it
    if (tooltipContainer) {

      // const tooltipData = regionDelayData.find((region: { state: string; }) => {
      //   return region.state === stateMap[SelectedState];
      // });
      let airlines: string[] = [];
      let airlineDelay: any = {};

      const tooltipdata = (regionDelayData[stateMap[SelectedState]])
      console.log('tooltipdata',tooltipdata);




      //convert tooltipdata to an array of objects
      Object.keys(tooltipdata).forEach((year) => {
        Object.keys(tooltipdata[year]).forEach((carrier) => {
           if(!airlines.includes(carrier)){
             airlines.push(carrier);
           }
           let value:number = 0;
           let cnt:number = 0;
           let searchTerm:string = selectedToggle ==='arrival'? 'arr_delay' : 'dep_delay';
           Object.keys(tooltipdata[year][carrier]).forEach((size) => {
            if(tooltipdata[year][carrier][size][searchTerm]!=null){
              value += parseFloat(tooltipdata[year][carrier][size][searchTerm]);
              cnt += 1;
          }
          else{
            value += 0;
            cnt += 1;
          }
          })
          if(value>0){
            if(!airlineDelay.hasOwnProperty(carrier)){
              airlineDelay[carrier] = [];
              airlineDelay[carrier].push([value/cnt]);
            }
            else{
              airlineDelay[carrier].push([value/cnt]);
            }
          }
          ;
          });
      });
      let airlineDelayRounded:any = {};

      Object.keys(airlineDelay).forEach((carrier) => {
        let value:number = 0;
        let cnt:number = 0;
        Object.keys(airlineDelay[carrier]).forEach((year) => {
          value += parseFloat(airlineDelay[carrier][year][0]);
          cnt += 1;
        });
        airlineDelayRounded[carrier] = Math.round(value/cnt * 100)/100;
      });

      console.log('airlineDelay',airlineDelayRounded);
      // Add content to the tooltip container


      tooltipContainer.innerHTML = `
        <div id="tooltip__header">${SelectedState}</div>
        <div id="tooltip__body">
          <div>Total Arrival Delay: ${Math.round(averageDelayArrival[stateMap[SelectedState]] * 100)/100}</div>
          <div>Total Months: ${Object.keys(tooltipdata).length}</div>
          <div id="tooltip__header">Carrier Average Delays</div>
          <div id="tooltip__table__body" class="table table-hover table-bordered">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Carrier</th>
                  <th scope="col">Average Delay</th>
                </tr>
              </thead>
              <tbody>
                ${airlines.map((airline) => {
                  return `
                    <tr>
                      <td>${stateMap[airline]}</td>
                      <td>${airlineDelayRounded[airline]}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              </table>
          </div>
        </div>
      `;
    }
  };

  const showAirportTooltip = (data: any) => {
    // Get reference to the tooltip container element
    const tooltipContainer = document.getElementById('tooltip__container');
    //set the z-index of the tooltip container to 1 to show it
    tooltipContainer?.style.setProperty('z-index', '1');

    //change the className from d-none to d-block to show the tooltip
    tooltipContainer?.classList.remove('d-none');

    // Update the class of the tooltip container to show it
    if (tooltipContainer) {

      // Add content to the tooltip container
      tooltipContainer.innerHTML = `
        <div class="tooltip__header">${airportName} (${airportCode})</div>
        <div class="tooltip__body">
          <div>Year: ${data.year}</div>
          <div>Delay: ${data.delay}</div>
        </div>
      `;
    }

  };


  const drawCircles = (data: any[]) => {
    //clear all previous layers except the basemap
    map.current?.getLayers().forEach((layer) => {
      if (layer instanceof VectorLayer && layer.get('id') === 'airport') {
        console.log('removing layer',layer.get('id'))
        map.current?.removeLayer(layer);
      }
    });

    data.forEach((d) => {
      console.log('drawing cirlce for',d.airport_name,d.longitude,d.latitude)
      const center = [d.longitude, d.latitude];
      const radius = (d.delay - colorScaleMinMaxStore[0])/(colorScaleMinMaxStore[1] - colorScaleMinMaxStore[0]) * 0.2;
      const color = [255, 0, 0, 0.25];

      const circle = new Circle(center, radius*10);
      const style = new Style({
        fill: new Fill({ color: color }),
        stroke: new Stroke({ color: color, width: 2 })
      });
      const feature = new Feature(circle);
      feature.setStyle(style);

      const vectorSource = new VectorSource({ features: [feature] });
      const vectorLayer = new VectorLayer({ source: vectorSource , zIndex: 2 });
      vectorLayer.set('id', 'airport');

      //add a event listener to show the tooltip when the user clicks on the circle
      vectorLayer.on('change', (e:any) => {
        if (e.target instanceof VectorLayer && e.target.get('id') === 'airport') {
          const features = e.target.getSource().getFeatures();
          console.log('features of the selected circle',features)
          features.forEach((feature: { on: (arg0: string, arg1: (evt: any) => void) => void; getProperties: () => any; }) => {
            feature.on('click', (evt:any) => {
              const data = feature.getProperties();
              showAirportTooltip(data);
            });
          });
        }
      });


      if (map.current) {
        map.current.addLayer(vectorLayer);
        map.current.getView().fit(circle.getExtent(), { padding: [20, 20, 20, 20], duration: 1000 });
      }
    });

    map.current?.getView().setZoom(5.5);
  };


  const drawDelay = ( seletedToggle:string ) => {
     //console.log('drawDelay Function',seletedToggle);
     if(seletedToggle === "arrival"){
      let min = Infinity;
      let max = -Infinity;
      let avgDict : {[key:string]:number} = {};

      setChartData1({});

      Object.keys(regionDelayData).forEach((key) => {

        let value:number = 0;
        let cnt = 0;
        if(selectedFiltersStore['state'][key]){
          for (let year in regionDelayData[key]) {
            if(selectedFiltersStore['year'][year]){
              for(let carrier in regionDelayData[key][year]){
                if(selectedFiltersStore['carrier'][carrier]){
                  for(let size in regionDelayData[key][year][carrier]){
                    if(regionDelayData[key][year][carrier][size]['arr_delay'] != null){
                      //parse the value to float and add it to value
                      value += parseFloat(regionDelayData[key][year][carrier][size]['arr_delay']);
                      //increment cnt
                      cnt += 1;
                      //build chartData1
                      buildChartData1(key,year,carrier,size,parseFloat(regionDelayData[key][year][carrier][size]['arr_delay']));
                      //update min and max
                    }
                    else{
                      //add 0 to value
                      value += 0;
                    }
                  }
                }
              }
            }
          }
        }
        //calculate average of valueArr
        //console.log(value,cnt)
        if(value>0){
          let avg = value / cnt;
          //update min and max
          min = Math.min(min, avg);
          max = Math.max(max, avg);
          //update avgDict
          avgDict[key] = avg;
        }
      });
      setAverageDelayArrival(avgDict);
      Object.keys(regionDelayData).forEach((key) => {
        const colorScaleArrival = d3.scaleSequential(d3.interpolateRgb("rgba(173, 216, 230, 0.5)","rgba(0, 0, 255, 0.5)")).domain([min, max]);
        //console.log('avg for ',key,'is ',avg);
        drawStateColor(stateMap[key], colorScaleArrival(avgDict[key]));
      });
      dispatch(flight_actions.set_flight_legend("arrival"))
      dispatch(flight_actions.set_flight_legend_minmax([min,max]))
      dispatch(flight_actions.set_flight_color_scale(d3.scaleSequential(d3.interpolateRgb("rgba(173, 216, 230, 0.5)","rgba(0, 0, 255, 0.5)")).domain([min, max])))
    }
    if(seletedToggle === "departure"){
      let min = Infinity;
      let max = -Infinity;
      let avgDict : {[key:string]:number} = {};

      setChartData1({});

      Object.keys(regionDelayData).forEach((key) => {
       //console.log(key);
       let value:number = 0;
       let cnt = 0;
      console.log('key',key,selectedFiltersStore['state'][key])
       if(selectedFiltersStore['state'][key])
       {
        for (let year in regionDelayData[key]) {
          if(selectedFiltersStore['year'][year]){
            for(let carrier in regionDelayData[key][year]){
              if(selectedFiltersStore['carrier'][carrier]){
                for(let size in regionDelayData[key][year][carrier]){
                  //if regionDelayData[key][year][carrier][size]['arr_delay'] is not null then add it to value
                  if(regionDelayData[key][year][carrier][size]['dep_delay'] != null){
                    //parse the value to float and add it to value
                    value += parseFloat(regionDelayData[key][year][carrier][size]['dep_delay']);
                    cnt += 1;
                    //console.log('value',value)
                     //update min and max
                      //build chartData1
                      buildChartData1(key,year,carrier,size,parseFloat(regionDelayData[key][year][carrier][size]['dep_delay']));
                  }
                  else{
                    //add 0 to value
                    value += 0;
                  }
                }
              }
            }
          }
        }
       }
       //calculate average of valueArr
       //console.log(value,cnt)
       //create a color scale with opacity 0.5
       if(value>0){
        let avg = value / cnt;
        //update min and max based on avg
         min = Math.min(min, avg);
         max = Math.max(max, avg);
         //update avgDict
         avgDict[key] = avg;
       }
     });
     //console.log('avgDict',avgDict)
     //console.log('min',min,'max',max)
     setAverageDelayDeparture(avgDict);
     Object.keys(regionDelayData).forEach((key) => {
      const colorScaleDeparture = d3.scaleSequential(d3.interpolateRgb("rgba(255, 192, 203, 0.5)","rgba(139, 0, 0, 0.5)")).domain([min, max]);
      //console.log('avg for ',key,'is ',avg);
      if(avgDict[key]!==null){
        console.log('key',key,avgDict[key])
        drawStateColor(stateMap[key], colorScaleDeparture(avgDict[key]));
      }

    });
    dispatch(flight_actions.set_flight_legend("departure"))
    dispatch(flight_actions.set_flight_legend_minmax([min,max]))
    //console.log('setting color scale for departure')
    dispatch(flight_actions.set_flight_color_scale(d3.scaleSequential(d3.interpolateRgb("rgba(255, 192, 203, 0.5)","rgba(139, 0, 0, 0.5)" )).domain([min, max])))
    }
  };

  // useEffect
  useEffect(() => {
    setConsolidatedChartData(chartData1);
  },[chartData1]
  );

  //useEffect consolidated data
  useEffect(() => {
    console.log('consolidatedChartData',consolidatedChartData)
    dispatch(flight_actions.set_flight_chart_data1(consolidatedChartData))
  },[consolidatedChartData]
  );

  // useEffect
  useEffect(() => {
    if (mapRef.current) {

      const tile = new TileLayer({
        source: new OSM()
      });

      tile.on('prerender',(evt)=>{
        if (evt.context) {
          const context = evt.context as CanvasRenderingContext2D;
          context.filter = 'grayscale(80%) invert(100%) ';
          context.globalCompositeOperation = 'source-over';
        }
      })

      tile.on('postrender', (evt) => {
        if (evt.context) {
          const context = evt.context as CanvasRenderingContext2D;
          context.filter = 'none';
        }
      });

      const statesSource = new VectorSource({
        url: 'https://raw.githubusercontent.com/openlayers/openlayers/main/examples/data/geojson/us-states.geojson',
        format: new GeoJSON(),
      });

      const statesLayer = new VectorLayer({
        source: statesSource,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.6)',
          }),
          stroke: new Stroke({
            color: '#319FD3',
            width: 1,
          }),
        }),
      });

      map.current = new Map({
        target: mapRef.current,
        //update the layers to make water black and land grey
        layers: [tile,statesLayer],
        view: new View({
          center: [-98.583333, 39.833333],
          zoom: 4,
        }),
      });


      // Add an event listener to the Select interaction to listen for feature selection
      const select = new SelectInteraction({
        //on feature select, set the selected state

        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new Stroke({
            color: '#319FD3',
            width: 1,
          }),
        }),
      });

      map.current.addInteraction(select);

      select.on('select', (event: { selected: string | any[]; }) => {
        //if not the same state , then update the selected state
        console.log('state select event',event)
        //check if the z-index of the selected layer is 1

        if(SelectedState!==event.selected[0].get('name')){
          if (event.selected.length > 0) {
            setSelectedState(event.selected[0].get('name'));
            // Zoom to the selected feature
            if(map.current){
              map.current.getView().fit(event.selected[0].getGeometry().getExtent(), { padding: [20, 20, 20, 20],
              maxZoom:5.5,
              duration: 1000,
              });
            }
          }
        }
      });

      //function to check for the circles with id airports
      map.current.on('click', (event: MapBrowserEvent<MouseEvent>) => {

        if(map.current){
        // Check if the clicked layer is a vector layer with ID "airport"
        const clickedLayer = event.target;
        if (clickedLayer instanceof VectorLayer && clickedLayer.get('id') === 'airport') {

          // Iterate over all layers and find the ones with a z-index of 2
          map.current.getLayers().forEach((layer) => {
            if (layer.getZIndex() === 2) {
              console.log('map click event', event.target);
              if(map.current){
                const feature = map.current.forEachFeatureAtPixel(event.pixel, (feature) => {
                  return feature;
                });
                if (feature) {
                  console.log('Selected feature:', feature.get('name'));
                }
              }
              // Get the clicked feature
              // Log the feature's name if it exists
            }
          });
        }
        }
      });

      // set false after map is loaded
      map.current.on("rendercomplete", () => {
        setIsLoading(false);
      });
    }
    return () => {
      if (map) {
        map.current?.setTarget(undefined);
      }
    };
  }, []);

  //const jsonData = require('./data.json');

  useEffect(() => {
      const depature_data =  axios.get('http://18.216.87.63:3000/api/region_delay').then((response) => {
        //console.log(response.data);
        parseData(response.data, regionDelayData);
        //setRegionFlag(true);
      });
  }, []);

//  useEffect(() => {
//   console.log('regionMin', regionMin, 'regionMax', regionMax);
//   }, [regionMin, regionMax]);



  useEffect(() => {
    console.log('regionDelayData', regionDelayData);
    dispatch(flight_actions.set_flight_region_delay_data(regionDelayData));
  }, [regionDelayData]);

  // useEffect(() => {
  //   if (airportLocation && map.current) {
  //     // Create the marker element
  //     const markerElement = document.createElement("div");
  //     markerElement.className = "marker";
  //     airportCode && (markerElement.title = airportCode.toUpperCase());

  //     const airportCodeElement = document.createElement("div");
  //     airportCodeElement.className = "airport-code";

  //     airportCode &&
  //       (airportCodeElement.textContent = airportCode.toUpperCase());
  //     markerElement.appendChild(airportCodeElement);

  //     // Create the marker overlay
  //     const markerOverlay = new Overlay({
  //       element: markerElement,
  //       position: airportLocation,
  //       positioning: "bottom-center",
  //     });

  //     // Add the marker overlay to the map
  //     map.current.addOverlay(markerOverlay);
  //   }
  // }, [airportLocation, airportCode]);


  //fetch the airport info from the api on start
  useEffect(() => {
    const api_link  = "http://18.216.87.63:3000/api/airports"
    if(airportCode===null){
      try{
        //get the airport info from api_link
        axios.get(api_link).then((res) => {
          setAirportInfo(res.data);
        });
      }
      catch(err){
        console.log(err);
      }
    }
  }, []);

  //selectedToggle useEffect
  useEffect(() => {
    //console.log("selectedToggle", selectedToggle);
    drawDelay(selectedToggle);
  }, [selectedToggle]);

  // useEffect(() => {
  //   console.log("colorScaleProps", colorScaleProps);
  // }, [colorScaleProps]);


  // useEffect(() => {
  //   console.log("selectedFilters", selectedFilters);
  // }, [selectedFilters]);


  useEffect(() => {
    console.log("selectedFiltersStore", selectedFiltersStore);
    drawDelay(selectedToggle);
  }, [selectedFiltersStore]);

  useEffect(() => {
    console.log("selectedState", SelectedState);
    dispatch(flight_actions.set_flight_selected_state(SelectedState));
    //send a request to http://18.216.87.63:3000/api/state_info?state=SelectedState
    let url = "http://18.216.87.63:3000/api/state_info?state=" + stateMap[SelectedState];
    console.log(url)
    axios.get(url).then((res) => {
      console.log('state_data',res.data);
      if(res.data.length>0){
        setShowGraphs(true);
        drawCircles(res.data);
        showTooltip(res.data);
      }
    });
  }, [SelectedState]);

  return (
    <>
      <div style={{ position: "relative" }}>
        <div id="opertaions__container">
          <div id="search__bar">
            <SearchBar setMapLocation={setMapLocation} />
          </div>
          <div id="filter__container">
            <FilterComponent />
          </div>
          <div id="props__container">
            <FilterPropsComponent props_type="timeline" />
          </div>
        </div>
        <div ref={mapRef} id="map" />
        {isLoading && <CircularProgress size={60} className={classes.loader} />}
        <div id="legend__container">
          {
            <LegendComponent />
          }
        </div>
        {airportCode && showAnalytics && (
        <div id="analytics__container">
          <AnalyticsComponent analytics_header={airportName}/>
        </div>
        )}
        <div id="main__filter__container">
          <MainFilter/>
        </div>
        <div>
          <img src={menu} alt="menu" id="filter__icon" onClick={handleFilterClick} />
          {showGraphs && (
            <>
              <div id="graph__container">
                {/* <StackedBarChart/> */}
                {/* <BarChartBorderRadius/> */}
                <BarChart/>
              </div>
              <div id="graph__container_2">
                <PieChart data={pie_data}/>
               </div>
            </>
          )}
        </div>
        <div id="tooltip__container" className="d-none">

        </div>
      </div>
    </>
  );
}

export default MapComponent;
