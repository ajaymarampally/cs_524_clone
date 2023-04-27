import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import SearchBar from "./SearchBar";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import { useGeographic } from "ol/proj";
import Overlay from "ol/Overlay";
import FilterComponent from "./FilterComponent";
import { LineString } from "ol/geom";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import * as d3 from "d3";
import { scaleSequential } from "d3-scale";
import { interpolateRdBu } from "d3-scale-chromatic";
import AnalyticsComponent from "./AnalyticsComponent";
import axios from "axios";
import { GeoJSON } from 'ol/format';
import { Fill, Stroke, Style } from 'ol/style';
import FilterPropsComponent from "./FilterProps";
import { OSM } from 'ol/source';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reduxRoot";
import LegendComponent from "./LegendComponent";
import stateMap from "./util/StateMap";
import { flight_actions } from "../redux/slices/flightSlice";
import MainFilter from "./MainFilter";

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
  const [regionMin, setRegionMin] = useState<number[]>([0,0]);
  const [regionMax, setRegionMax] = useState<number[]>([0,0]);

  //colorscaleProps of type d3.scaleSequential(d3.interpolateRgb("rgba(139, 0, 0, 0.5)", "rgba(255, 192, 203, 0.5)")).domain([min, max])

  const [colorScaleProps, setColorScaleProps] = useState<any>(null);

  useGeographic();
  
  //redux init
  const dispatch = useDispatch();
  const mapStore = useSelector((state: RootState) => state);
  const selectedToggle = mapStore.flight.selectedToggle;
  const regionalDataStore = mapStore.flight.regionDelayData;
  const [selectedFilters, setSelectedFilters] = React.useState<{[key: string]: string[]}>({
    "state": [],
    "year": [],
    "size": [],
    "carrier": [],
});


  //functions
  async function parseData(newJsonData:any, regionDelayTree:any) {
    const newTree = Object.assign({}, regionDelayTree);
    let minArrDelay = 999999999999;
    let maxArrDelay = -999999999999;
    let minDepDelay = 999999999999; 
    let maxDepDelay = -999999999999;
    // let FiltersData = {
    //   f_iso_regions: {},
    //   f_year_month : {},
    //   f_unique_carrier :{},
    //   f_size : {},
    // };
    
  
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
  
  
        //filter data logic
  
        // FiltersData[f_iso_regions][iso_region]===undefined?FiltersData[f_iso_regions][iso_region]=1:FiltersData[f_iso_regions][iso_region]+=1;
  
        // FiltersData[f_year_month][year_month]===undefined?FiltersData[f_year_month][year_month]=1:FiltersData[f_year_month][year_month]+=1;
  
        // FiltersData[f_unique_carrier][unique_carrier]===undefined?FiltersData[f_unique_carrier][unique_carrier]=1:FiltersData[f_unique_carrier][unique_carrier]+=1;
  
        // FiltersData[f_size][size]===undefined?FiltersData[f_size][size]=1:FiltersData[f_size][size]+=1;
        
    });
    setRegionMin([minArrDelay,minDepDelay]);
    setRegionMax([maxArrDelay,maxDepDelay]);
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

  //function to draw arcs
  // const drawArc = (start: number[], end: number[], lineDash: number[]) => {
  //   const arc = new LineString([start, end]);
  //   const arcFeature = new Feature({
  //     geometry: arc,
  //     name: "Arc",
  //   });

  //   const arcStyle = new Style({
  //     stroke: new Stroke({
  //       color: colorScale(Math.random() * 100),
  //       width: 2,
  //       lineDash: lineDash,
  //     }),
  //   });
  //   arcFeature.setStyle(arcStyle);
  //   const vectorSource = new VectorSource({
  //     features: [arcFeature],
  //   });
  //   const vectorLayer = new VectorLayer({
  //     source: vectorSource,
  //   });
  //   map.current?.addLayer(vectorLayer);

  //   // //event handler for arc click and hover events
  //   // map.current?.on("click", (evt) => {
  //   //   const features = map.current?.getFeaturesAtPixel(evt.pixel);
  //   //   if (features) {
  //   //     const feature = features[0];
  //   //     if (feature.get("name") === "Arc") {
  //   //       console.log("clicked on arc");
  //   //     }
  //   //   }
  //   // });
  // };

  const drawDelay = ( seletedToggle:string ) => {
     //console.log('drawDelay Function',seletedToggle);
     if(seletedToggle === "arrival"){
      let min = Infinity;
      let max = -Infinity;
      let avgDict : {[key:string]:number} = {};

      Object.keys(regionDelayData).forEach((key) => {
        //console.log(key);
        //add key to selectedFilters['state']
        //check if selectedFilters['state'] already has the key , if not then add it
        if(!selectedFilters['state'].includes(key)){
          setSelectedFilters((prevState) => ({
            ...prevState,
            state: [...prevState.state, key],
          }));    
        } 
        let value:number = 0;
        let cnt = 0;
        for (let year in regionDelayData[key]) {
          if(!selectedFilters['year'].includes(year)){
            setSelectedFilters((prevState) => ({
              ...prevState,
              year: [...prevState.year, year],
            }));  
          }
          for(let carrier in regionDelayData[key][year]){
            if(!selectedFilters['carrier'].includes(carrier)){
              setSelectedFilters((prevState) => ({
                ...prevState,
                carrier: [...prevState.carrier, carrier],
              }));  
            }
            for(let size in regionDelayData[key][year][carrier]){
              if(!selectedFilters['size'].includes(size)){
                setSelectedFilters((prevState) => ({
                  ...prevState,
                  size: [...prevState.size, size],
                }));  
              }
              //if regionDelayData[key][year][carrier][size]['arr_delay'] is not null then add it to value
              if(regionDelayData[key][year][carrier][size]['arr_delay'] != null){
                //parse the value to float and add it to value
                value += parseFloat(regionDelayData[key][year][carrier][size]['arr_delay']);
                //increment cnt
                cnt += 1;
                //update min and max
              }
              else{
                //add 0 to value
                value += 0;
              }
            }
          }
        }
        //calculate average of valueArr
        //console.log(value,cnt)
        let avg = value / cnt;
        //update min and max
        min = Math.min(min, avg);
        max = Math.max(max, avg);
        //update avgDict
        avgDict[key] = avg;
      });
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

      Object.keys(regionDelayData).forEach((key) => {
       //console.log(key);
       let value:number = 0;
       let cnt = 0;
       for (let year in regionDelayData[key]) {
         for(let carrier in regionDelayData[key][year]){
           for(let size in regionDelayData[key][year][carrier]){
             //if regionDelayData[key][year][carrier][size]['arr_delay'] is not null then add it to value
             if(regionDelayData[key][year][carrier][size]['dep_delay'] != null){
               //parse the value to float and add it to value
               value += parseFloat(regionDelayData[key][year][carrier][size]['dep_delay']);
               cnt += 1;
                //update min and max
             }
             else{
               //add 0 to value
               value += 0;
             }
           }
         }
       }
       //calculate average of valueArr
       //console.log(value,cnt)
       //create a color scale with opacity 0.5
       let avg = value / cnt;
       //update min and max based on avg
        min = Math.min(min, avg);
        max = Math.max(max, avg);
        //update avgDict
        avgDict[key] = avg;
     });
     Object.keys(regionDelayData).forEach((key) => {
      const colorScaleDeparture = d3.scaleSequential(d3.interpolateRgb("rgba(255, 192, 203, 0.5)","rgba(139, 0, 0, 0.5)")).domain([min, max]);
      //console.log('avg for ',key,'is ',avg);
      drawStateColor(stateMap[key], colorScaleDeparture(avgDict[key]));

    });
    dispatch(flight_actions.set_flight_legend("departure"))
    dispatch(flight_actions.set_flight_legend_minmax([min,max]))
    //console.log('setting color scale for departure')
    dispatch(flight_actions.set_flight_color_scale(d3.scaleSequential(d3.interpolateRgb("rgba(255, 192, 203, 0.5)","rgba(139, 0, 0, 0.5)" )).domain([min, max])))
    }
  };



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

      map.current = new Map({
        target: mapRef.current,
        //update the layers to make water black and land grey
        layers: [
          tile,    ],

        


        view: new View({
          center: [-98.583333, 39.833333],
          zoom: 4,
        }),
      });

      // set false after map is loaded
      map.current.on("rendercomplete", () => {
        setIsLoading(false);
      });
    }

    //drawCountryColor(country_dict);
    //drawCountryColor();
    //drawStateColor(state_dict);

    //draw the arcs
    // for (const key in arcInBoundHash) {
    //   setTimeout(() => {
    //     drawArc(arcInBoundHash[key][0], arcInBoundHash[key][1], [0, 0]);
    //   }, 2000);
    // }

    // for (const key in arcOutBoundHash) {
    //   setTimeout(() => {
    //     drawArc(arcOutBoundHash[key][0], arcOutBoundHash[key][1], [0, 0]);
    //   }, 2000);
    // }

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
    dispatch(flight_actions.set_flight_region_delay_data(regionDelayData));
  }, [regionDelayData]);

  useEffect(() => {
    if (airportLocation && map.current) {
      // Create the marker element
      const markerElement = document.createElement("div");
      markerElement.className = "marker";
      airportCode && (markerElement.title = airportCode.toUpperCase());

      const airportCodeElement = document.createElement("div");
      airportCodeElement.className = "airport-code";

      airportCode &&
        (airportCodeElement.textContent = airportCode.toUpperCase());
      markerElement.appendChild(airportCodeElement);

      // Create the marker overlay
      const markerOverlay = new Overlay({
        element: markerElement,
        position: airportLocation,
        positioning: "bottom-center",
      });

      // Add the marker overlay to the map
      map.current.addOverlay(markerOverlay);
    }
  }, [airportLocation, airportCode]);


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


  useEffect(() => {
    console.log("selectedFilters", selectedFilters);
  }, [selectedFilters]);

  
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
      </div>
    </>
  );
}

export default MapComponent;
