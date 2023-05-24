import React, { useEffect,useState } from "react";
import type { RadioChangeEvent } from 'antd';
import { Radio } from 'antd';
import LineChart from "./graphs/LineChart";
import { useSelector } from "react-redux";

interface AirportData {
    [key: string]: any;
  }



const TooltipComponent= () => {

    let optionsWithDisabled = [
        { label: 'Large', value: 'L'  },
        { label: 'Medium', value: 'M' },
        { label: 'Small', value: 'S'  },
        ];

    const selectedToggle = useSelector((state: any) => state.flight.selectedToggle);
    const [largeAirportList, setLargeAirportList] = useState<Array<Array<string>>>([]);
    const [mediumAirportList, setMediumAirportList] = useState<Array<Array<string>>>([]);
    const [smallAirportList, setSmallAirportList] = useState<Array<Array<string>>>([]);
    const [value, setValue] = useState('X');
    const [largeFlag, setLargeFlag] = useState(false);
    const [mediumFlag, setMediumFlag] = useState(false);
    const [smallFlag, setSmallFlag] = useState(false);
    const [largeFlag2, setLargeFlag2] = useState(false);
    const [mediumFlag2, setMediumFlag2] = useState(false);
    const [smallFlag2, setSmallFlag2] = useState(false);

    //circledata
    const circleData = useSelector((state: any) => state.flight.circleData);

    const parseCData = (cData:AirportData)=>{
        const sAirports: Array<Array<string>> = [];
        const mAirports: Array<Array<string>> = [];
        const lAirports: Array<Array<string>> = [];
        cData.map((airport:any)=>{
            if (selectedToggle.startsWith(airport.direction))
            {console.log("data Anal : ",airport);
            if (airport['size']==="large")
            {
                lAirports.push([airport.iata_code,airport.airport_name])
            }
            if (airport['size']==="medium")
            {
                mAirports.push([airport.iata_code,airport.airport_name])
            }
            if (airport['size']==="small")
            {
                sAirports.push([airport.iata_code,airport.airport_name])
            }}
        });
        
        setLargeAirportList(lAirports);
        setMediumAirportList(mAirports);
        setSmallAirportList(sAirports);

        if(lAirports.length>0){
            setValue('L')
            setLargeFlag2(true)
        }
        else if (mAirports.length>0){
            setValue('M')
            setMediumFlag2(true)
        }else if (sAirports.length>0){
            setValue('S')
            setSmallFlag2(true)
        }else{
            setValue('x')
        }
    }

      //useEffect
    useEffect(() => {
        parseCData(circleData);
    }, [circleData]);

    useEffect(() => {
        if(value=='L')
        {
            setLargeFlag(true)
            setMediumFlag(false)
            setSmallFlag(false)
        }
        else if(value=='M')
        {
            setLargeFlag(false)
            setMediumFlag(true)
            setSmallFlag(false)
        }
        else if(value=='S')
        {
            setLargeFlag(false)
            setMediumFlag(false)
            setSmallFlag(true)
        }
        else
        {
            setLargeFlag(false)
            setMediumFlag(false)
            setSmallFlag(false)
        }
    }, [value]);
    
    const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setValue(value);
    };
  
    return (
        <div id="tooltip__container">
            <h4>
            Airport Size :
            </h4>  
            <Radio.Group
            options={optionsWithDisabled}
            onChange={onChange}
            value={value}
            optionType="button"
            buttonStyle="solid"
            />

            <div id="tooltip_linecharts">
            { 
            largeFlag && largeAirportList.map((item) => (
                <LineChart iata_code={item[0]} airport_name={item[1]}   delay_mode={selectedToggle}/>
            ))
            }
            
            { 
            mediumFlag && mediumAirportList.map((item) => (
                <LineChart iata_code={item[0]} airport_name={item[1]}   delay_mode={selectedToggle}/>
            ))
            }  

            { 
            smallFlag && smallAirportList.map((item) => (
                <LineChart iata_code={item[0]} airport_name={item[1]}   delay_mode={selectedToggle}/>
            ))
            
            }    

            </div>

        </div>
    );
  }

export default TooltipComponent;