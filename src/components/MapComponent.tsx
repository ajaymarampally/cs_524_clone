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
import { GroupedBarChart } from "./graphs/GroupedBarChart";
import { VerticalBarChart } from "./graphs/VerticalBarChart";
import { none } from "ol/centerconstraint";

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
  const [consolidatedChartData, setConsolidatedChartData] = useState<any>(null);
  const [showGraphs, setShowGraphs] = useState<boolean>(false);
  const [SelectedState, setSelectedState] = useState<any>(null);
  const [averageStateLevelDelay, setAverageStateLevelDelay] = useState<{[key:string]:{[key:string]:number}}>({});
  const [isStateSelected, setIsStateSelected] = useState(false);
  const [initLoad,setInitLoad] = useState(false);
  const [airportLayerList, setAirportLayerList] = useState<Array<VectorLayer<VectorSource>>>([]);
  const [Graph1Dic, setGraph1Dic] = useState<{[key:string]:{[key:string]:{[key:string]:number}}}>({});
  const [circleData, setCircleData] = useState<Array<{[key:string]:any}>>([]);
  const [triggerRender,setTriggerRender] = useState<number>((0));
  const [lastClick,setLastClick] = useState<number[]>([]);

  const [graphDataAdapter,setGraphDataAdapeter] = useState<{[key:string]:{[key:string]:{[key:string]:number}}}>({
    "graph1":{},//month VS delay
    "graph2":{} //carrier VS delay
  });

  const [LevelZeroGraphData,setLevelZeroGraphData]=useState<{[key:string]:{[key:string]:{[key:string]:number}}}>({
    "graph1":{},//month VS delay
    "graph2":{} //carrier VS delay
  });

  const [LevelOneGraphData,setLevelOneGraphData]=useState<{[key:string]:{[key:string]:{[key:string]:{[key:string]:number}}}}>({
    "graph1":{},//month VS delay
    "graph2":{} //carrier VS delay
  })





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


  const carrierDict: { [key: string]: string } = {
    AA: "American Airlines",
    DL: "Delta Air Lines",
    UA: "United Airlines",
    HP: "America West Airlines",
    NW: "Northwest Airlines",
    WN: "Southwest Airlines",
    US: "US Airways",
    CO: "Continental Airlines",
    AS: "Alaska Airlines",
    MQ: "American Eagle Airlines",
  };

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
    let filteredData:any = {
      "state": {},
      "year": {},
      "size": {},
      "carrier": {},
      "direction": {"departures": true, "arrival": false},
    };
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
        }
        if(delay_type==='dep'){
            newTree[iso_region][year_month][unique_carrier][size]['dep_delay'] = delay;
         }

        if (!filteredData['state'][iso_region]) {
          filteredData['state'][iso_region] = true;
        }

        if (!filteredData['year'][year_month]) {
          filteredData['year'][year_month] = true;
        }

        if (!filteredData['size'][size]) {
          filteredData['size'][size] = true;
        }

        if (!filteredData['carrier'][unique_carrier]) {
          filteredData['carrier'][unique_carrier] = true;
        }
        // setGlobalFilter((prevState:any) => {
        //   return {
        //     ...prevState,
        //     state: {
        //       ...prevState.state,
        //       [iso_region]: true
        //     },
        //     year: {
        //       ...prevState.year,
        //       [year_month]: true
        //     },
        //     size: {
        //       ...prevState.size,
        //       [size]: true
        //     },
        //     carrier: {
        //       ...prevState.carrier,
        //       [unique_carrier]: true
        //     },
        //   }
        // });



    });
    /*
        sort the filteredData object
      sort filteredData['state'] in alphabetical order according to stateMap
      e.g filteredData['state'] = { "US-AL":true , "US-AK":true , "US-AZ":true , "US-AR":true , "US-CA":true , "US-CO":true , "US-CT":true , "US-DE":true , "US-FL":true , "US-GA":true , "US-HI":true , "US-ID":true , "US-IL":true , "US-IN":true , "US-IA":true , "US-KS":true , "US-KY":true , "US-LA":true , "US-ME":true , "US-MD":true , "US-MA":true , "US-MI":true , "US-MN":true , "US-MS":true , "US-MO":true , "US-MT":true , "US-NE":true , "US-NV":true , "US-NH":true , "US-NJ":true , "US-NM":true , "US-NY":true , "US-NC":true , "US-ND":true , "US-OH":true , "US-OK":true , "US-OR":true , "US-PA":true , "US-RI":true , "US-SC":true , "US-SD":true , "US-TN":true , "US-TX":true , "US-UT":true , "US-VT":true , "US-VA":true , "US-WA":true , "US-WV":true , "US-WI":true , "US-WY":true }
      sort filteredData['year'] in chronological order
      sort filteredData['size'] in alphabetical order
      e.g filteredData['size'] = {'large':true,'medium':true,'small':true}
      sort filteredData['carrier'] in alphabetical order according to carrierDict
    */

    let sortedFilteredData:any = {
      "state": {},
      "year": {},
      "size": {},
      "carrier": {},
      "direction": {"departures": true, "arrival": false},
    };

    Object.keys(filteredData).forEach((key) => {
      if(key==='state'){
        Object.keys(filteredData[key]).sort().forEach((state) => {
          sortedFilteredData[key][state] = filteredData[key][state];
        });
      }
      else if(key==='year'){
        Object.keys(filteredData[key]).sort().forEach((year) => {
          sortedFilteredData[key][year] = filteredData[key][year];
        });
      }
      else if(key==='size'){
        Object.keys(filteredData[key]).sort().forEach((size) => {
          sortedFilteredData[key][size] = filteredData[key][size];
        });
      }

      else if(key==='carrier'){
        Object.keys(filteredData[key]).sort().forEach((carrier) => {
          sortedFilteredData[key][carrier] = filteredData[key][carrier];
        });
      }

      else if(key==='direction'){
        Object.keys(filteredData[key]).sort().forEach((direction) => {
          sortedFilteredData[key][direction] = filteredData[key][direction];
        });
      }

    });
    console.log('filtered data in map component',sortedFilteredData);
    setGlobalFilter(sortedFilteredData);
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
          <div>Total Arrival Delay: ${Math.round(averageStateLevelDelay['arrival'][stateMap[SelectedState]] * 100)/100}</div>
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

    airportLayerList.forEach((layer)=>{
       console.log("removing circle layer")
       map.current?.removeLayer(layer);
    })

    if(SelectedState==null){
      setAirportLayerList([]);
    }

    let tempAirportLayerList:any = []
    data.forEach((d) => {
      console.log('drawing circle for', d.airport_name, d.longitude, d.latitude);
      if (selectedToggle.startsWith(d.direction))
      {
      const center = [d.longitude, d.latitude];
      const radius = (d.delay - colorScaleMinMaxStore[0]) / (colorScaleMinMaxStore[1] - colorScaleMinMaxStore[0]) * 0.2;
      const color = [255, 0, 0, 0.25];

      const circle = new Circle(center, radius * 10);
      const style = new Style({
        fill: new Fill({ color: color }),
        stroke: new Stroke({ color: color, width: 2 })
      });
      const feature = new Feature(circle);
      feature.setStyle(style);

      const vectorSource = new VectorSource({ features: [feature] });
      const vectorLayer = new VectorLayer({ source: vectorSource, zIndex: 2 });

      //Set the ID for the vector layer
      vectorLayer.set('id', 'airport_' + d.airport_name);

      //Add an event listener to show the tooltip when the user clicks on the circle
      vectorLayer.on('change', (e: any) => {
        const layerId = e.target?.get('id');
        if (e.target instanceof VectorLayer && layerId?.startsWith('airport_')) {
          const features = e.target.getSource().getFeatures();
          console.log('features of the selected circle', features);
          features.forEach((feature: any) => {
            feature.on('click', (evt: any) => {
              const data = feature.getProperties();
              showAirportTooltip(data);
            });
          });
        }
      });

      if (map.current) {
        map.current.addLayer(vectorLayer);
        tempAirportLayerList.push(vectorLayer);
        map.current.getView().fit(circle.getExtent(), { padding: [20, 20, 20, 20], duration: 1000 });
      }
    }
    });

    setAirportLayerList(tempAirportLayerList)
    map.current?.getView().setZoom(5.5);

  };

  const calculateStateLevelDelay = ()=>{
    let minArr = Infinity;
    let maxArr = -Infinity;
    let avgDictArr : {[key:string]:number} = {};

    let minDep = Infinity;
    let maxDep = -Infinity;
    let avgDictDep : {[key:string]:number} = {};

    let TempGraph1Dic : any = {};
    let tempGraph1 : any = {};
    let tempGraph2 : any = {};

    let level1Graph1:any = {};
    let level1Graph2:any = {};


    Object.keys(regionDelayData).forEach((key) => {

      let valueArr:number = 0;
      let valueDep:number = 0;
      let cnt = 0;
      if(selectedFiltersStore['state'][key]){
        for (let year in regionDelayData[key]) {
          if(selectedFiltersStore['year'][year]){
            for(let carrier in regionDelayData[key][year]){
              if(selectedFiltersStore['carrier'][carrier]){
                for(let size in regionDelayData[key][year][carrier]){
                  if(regionDelayData[key][year][carrier][size]['arr_delay'] != null){
                    //parse the value to float and add it to value
                    valueArr += parseFloat(regionDelayData[key][year][carrier][size]['arr_delay']);
                    valueDep += parseFloat(regionDelayData[key][year][carrier][size]['dep_delay']);
                    //increment cnt
                    cnt += 1;

                    if(!TempGraph1Dic[year]){
                      TempGraph1Dic[year]={}
                    }
                    if(!TempGraph1Dic[year][carrier])
                    {
                      TempGraph1Dic[year][carrier] = { "arrVal":0,"depVal":0,"cnt":0}
                    }

                    if(!tempGraph1[year]){
                      tempGraph1[year]={"arrVal":0,"depVal":0,"cnt":0}
                    }
                    if(!tempGraph2[carrier]){
                      tempGraph2[carrier]={"arrVal":0,"depVal":0,"cnt":0}
                    }

                    if(!level1Graph1[key]){
                        level1Graph1[key]={}
                    }
                    if(!level1Graph1[key][year]){
                      level1Graph1[key][year]={"arrVal":0,"depVal":0,"cnt":0}
                    }

                    if(!level1Graph2[key]){
                      level1Graph2[key]={}
                    }
                    if(!level1Graph2[key][carrier]){
                      level1Graph2[key][carrier]={"arrVal":0,"depVal":0,"cnt":0}
                    }

                    tempGraph1[year]["arrVal"] += valueArr
                    tempGraph1[year]["depVal"] += valueDep
                    tempGraph1[year]["cnt"] += 1

                    tempGraph2[carrier]["arrVal"] += valueArr
                    tempGraph2[carrier]["depVal"] += valueDep
                    tempGraph2[carrier]["cnt"] += 1

                    TempGraph1Dic[year][carrier]["arrVal"] += valueArr
                    TempGraph1Dic[year][carrier]["depVal"] += valueDep
                    TempGraph1Dic[year][carrier]["cnt"] += 1

                    level1Graph1[key][year]["arrVal"] += valueArr
                    level1Graph1[key][year]["depVal"] += valueDep
                    level1Graph1[key][year]["cnt"] += 1

                    level1Graph2[key][carrier]["arrVal"] += valueArr
                    level1Graph2[key][carrier]["depVal"] += valueDep
                    level1Graph2[key][carrier]["cnt"] += 1

                  }
                  else{
                    //add 0 to value
                    valueArr += 0;
                    valueDep += 0;
                  }
                }
              }
            }
          }
        }
      }
      //calculate average of valueArr
      //console.log(value,cnt)
      valueArr = Math.abs(valueArr);
      valueDep = Math.abs(valueDep);
      if(valueArr>0){
        let avgArr = valueArr / cnt;
        //update min and max
        minArr = Math.min(minArr, avgArr);
        maxArr = Math.max(maxArr, avgArr);
        //update avgDict
        avgDictArr[key] = avgArr;
      }

      if(valueDep>0){
        let avgDep = valueDep / cnt;
        //update min and max
        minDep = Math.min(minDep, avgDep);
        maxDep = Math.max(maxDep, avgDep);
        //update avgDict
        avgDictDep[key] = avgDep;
      }

    });

    // fs = filteredStates = [Florida,Texas,Illinois]
    /*
    if SelectedState!=null{
      fs.forEach(s)={
      if s == SelectedState:
      SelectedState = null
    }
  }
    
    */ 
  if(SelectedState!=null){
    Object.keys(selectedFiltersStore['state']).forEach((state:any)=>{
      if(stateMap[SelectedState] === state&& selectedFiltersStore['state'][state] === false){
        setSelectedState(null)
      }
    })  
  }


    avgDictArr['min'] = minArr;
    avgDictArr['max'] = maxArr;

    avgDictDep['min'] = minDep;
    avgDictDep['max'] = maxDep;

    setAverageStateLevelDelay(
      {
        'arrival': avgDictArr,
        'departure' : avgDictDep
      }
    )

    let FinalGraph1Dic : any = {};
    Object.keys(TempGraph1Dic).forEach((month) => {
      if(!FinalGraph1Dic[month]){
        FinalGraph1Dic[month]={}
      }
      for(let carrier in TempGraph1Dic[month]){
        if(!FinalGraph1Dic[month][carrier]){
          FinalGraph1Dic[month][carrier]={}
        }

        FinalGraph1Dic[month][carrier]["arrDelay"]=TempGraph1Dic[month][carrier]["arrVal"]/TempGraph1Dic[month][carrier]["cnt"]
        FinalGraph1Dic[month][carrier]["depDelay"]=TempGraph1Dic[month][carrier]["depVal"]/TempGraph1Dic[month][carrier]["cnt"]
      }

    });


    setLevelZeroGraphData(
      {
        "graph1":tempGraph1, //month VS delay
        "graph2":tempGraph2   //carrier VS delay}
      });

    setLevelOneGraphData({
      "graph1":level1Graph1, //month VS delay
      "graph2":level1Graph2   //carrier VS delay}
    });

    setGraph1Dic(FinalGraph1Dic);
  }

  const drawDelay = ( seletedToggle:string ) => {
      try {
        if (selectedToggle === 'arrival') {
          Object.keys(regionDelayData).forEach((key) => {
            const colorScaleArrival = d3
              .scaleSequential(d3.interpolateRgb("rgba(255, 255, 128, 0.5)", "rgba(255, 204, 77, 0.5)"))
              .domain([averageStateLevelDelay['arrival']['min'], averageStateLevelDelay['arrival']['max']]);
            drawStateColor(stateMap[key], colorScaleArrival(averageStateLevelDelay['arrival'][key]));
          });

          dispatch(flight_actions.set_flight_legend('arrival'));
          dispatch(flight_actions.set_flight_legend_minmax([averageStateLevelDelay['arrival']['min'], averageStateLevelDelay['arrival']['max']]));
          dispatch(flight_actions.set_flight_color_scale(
            d3.scaleSequential(d3.interpolateRgb("rgba(255, 255, 128, 0.5)", "rgba(255, 204, 77, 0.5)"))
              .domain([averageStateLevelDelay['arrival']['min'], averageStateLevelDelay['arrival']['max']])
          ));
        }

        if(seletedToggle === "departure"){
          Object.keys(regionDelayData).forEach((key) => {
            const colorScaleDeparture = d3.scaleSequential(d3.interpolateRgb("rgba(173, 216, 230, 0.5)","rgba(0, 0, 255, 0.5)")).domain([averageStateLevelDelay['departure']['min'], averageStateLevelDelay['departure']['max']]);
            drawStateColor(stateMap[key], colorScaleDeparture(averageStateLevelDelay['departure'][key]));
          });
          dispatch(flight_actions.set_flight_legend("departure"))
          dispatch(flight_actions.set_flight_legend_minmax([averageStateLevelDelay['departure']['min'],averageStateLevelDelay['departure']['max']]))
          dispatch(flight_actions.set_flight_color_scale(d3.scaleSequential(d3.interpolateRgb("rgba(173, 216, 230, 0.5)","rgba(0, 0, 255, 0.5)" )).domain([averageStateLevelDelay['departure']['min'], averageStateLevelDelay['departure']['max']])))
        }
      }catch (error) {
        // Handle the error here
        //console.log("Dic not calculated yet")
      }

    };



  // //useEffect consolidated data
  // useEffect(() => {
  //   console.log('consolidatedChartData',consolidatedChartData)
  //   dispatch(flight_actions.set_flight_chart_data1(consolidatedChartData))
  // },[consolidatedChartData]
  // );

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

      select.on('select', (event: { mapBrowserEvent: MapBrowserEvent<UIEvent>, selected: string | any[]}) => {
        try {
          console.log('state select event : ', event.mapBrowserEvent.pixel, "features",select.getFeatures());
          setLastClick(event.mapBrowserEvent.pixel);
          /*
            sfs --> sfs[selected_state] === false 
          */


          if (SelectedState !== event.selected[0].get('name') ) {
            if (event.selected.length > 0 && selectedFiltersStore['state'][stateMap[event.selected[0].get('name')]] !==false ) {
              console.log('florida should not be selected',selectedFiltersStore['state'][stateMap[event.selected[0].get('name')]],[stateMap[event.selected[0].get('name')]],selectedFiltersStore['state'])
              
              setSelectedState(event.selected[0].get('name'));
              setIsStateSelected(true);

              if (map.current) {
                map.current.getView().fit(event.selected[0].getGeometry().getExtent(), {
                  padding: [20, 20, 20, 20],
                  maxZoom: 5.5,
                  duration: 1000,
                });
              }
            }
          }
        } catch (error) {
          // Handle the error here
          setSelectedState(null);
          setIsStateSelected(false);
        }
      });

      map.current.addInteraction(select);

      // set false after map is loaded
      map.current.on("rendercomplete", () => {
        setIsLoading(false);
        setShowGraphs(true);
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
        parseData(response.data, regionDelayData).then(
          ()=>{
            setInitLoad(true);
          }
        );
      });
  }, []);

  useEffect(() => {
    dispatch(flight_actions.set_flight_chart_data1(graphDataAdapter));
  }, [graphDataAdapter]);

  useEffect(() => {
    if (SelectedState == null)
      setGraphDataAdapeter(LevelZeroGraphData)
    else
      {
        let tempGraph = {
          "graph1" : {},
          "graph2" : {}
        }

        if(LevelOneGraphData["graph1"][stateMap[SelectedState]] && LevelOneGraphData["graph2"][stateMap[SelectedState]]){
          tempGraph = {
            "graph1" : LevelOneGraphData["graph1"][stateMap[SelectedState]],
            "graph2" : LevelOneGraphData["graph2"][stateMap[SelectedState]]
          } 
        }        
        setGraphDataAdapeter(tempGraph)
      }
  }, [SelectedState,LevelZeroGraphData,LevelOneGraphData]);


  useEffect(() => {
    calculateStateLevelDelay();
    dispatch(flight_actions.set_flight_region_delay_data(regionDelayData));
  }, [regionDelayData]);



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

  //trigger drawDelay
  useEffect(() => {
    setTriggerRender(triggerRender+1);
    drawDelay(selectedToggle);

  }, [selectedToggle]);

  useEffect(() => {
    setTriggerRender(triggerRender+1);
    drawDelay(selectedToggle);
  }, [averageStateLevelDelay]);

  //Redux update graph1 data
  useEffect(() => {
    console.log("Graph1Dic : ",Graph1Dic)
    //dispatch(flight_actions.set_flight_chart_data1(Graph1Dic))
  }, [Graph1Dic]);

  //Render
  useEffect(() => {
    //drawDelay(selectedToggle);
    drawCircles(circleData);
    //fireClickEvent(lastClick[0],lastClick[1]);
  }, [triggerRender]);

  useEffect(() => {
    console.log("selectedFiltersStore", selectedFiltersStore);
    calculateStateLevelDelay();
  }, [selectedFiltersStore]);

  useEffect(() => {

    //state disselected
    if (SelectedState === null)
    {
      setCircleData([]);
      setTriggerRender(triggerRender+1);
    }

      dispatch(flight_actions.set_flight_selected_state(SelectedState));
      //send a request to http://18.216.87.63:3000/api/state_info?state=SelectedState
      let url = "http://18.216.87.63:3000/api/state_info?state=" + stateMap[SelectedState];
      axios.get(url).then((res) => {
        if(res.data.length>0){
          setShowGraphs(true);
          setCircleData(res.data);
          //showTooltip(res.data);
          setTriggerRender(triggerRender+1);
        }
        else{
          setCircleData([]);
          setTriggerRender(triggerRender+1);
        }
      });



  }, [SelectedState]);

  function fireClickEvent(pixelX: number, pixelY: number): void {
    console.log("firing pixel ",pixelX,pixelY,lastClick)
    if (pixelX != null && pixelX !=undefined && pixelY != null && pixelY !=undefined)
    {
      const event = new MouseEvent('click', {
      clientX: pixelX,
      clientY: pixelY,
      bubbles: true,
      cancelable: true
      });

      document.elementFromPoint(pixelX, pixelY)?.dispatchEvent(event);
      console.log("firing pixel ",pixelX,pixelY)
    }
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        <div id="opertaions__container">
          {/* <div id="search__bar">
            <SearchBar setMapLocation={setMapLocation} />
          </div> */}
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
                {/* <BarChart/> */}
                {/* {<GroupedBarChart/>} */}
                <VerticalBarChart/>
              </div>
              <div id="graph__container_2">
                <PieChart />
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
