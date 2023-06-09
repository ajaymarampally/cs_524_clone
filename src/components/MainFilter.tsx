import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reduxRoot";
import stateMap from "./util/StateMap";
import { Checkbox, Menu, Dropdown } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { flight_actions } from "../redux/slices/flightSlice";
import FilterFunction from "./util/FilterFunction";

/*
    filters --> state (dropdown of all states)
    filter --> year (dropdown of 12 months of the year 2001-01 to 2001-12)
    filter --> size (dropdown of 3 sizes: small, medium, large)
    filter --> unique_carrier (dropdown of all unique carriers )
*/

function MainFilter() {

    //redux hooks
    const dispatch = useDispatch();
    const FiltersStore = useSelector((state: RootState) => state.flight.selectedFilters);


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

  const [isStateOpen, setIsStateOpen] = React.useState<boolean>(false);
  const [isYearOpen, setIsYearOpen] = React.useState<boolean>(false);
  const [isSizeOpen, setIsSizeOpen] = React.useState<boolean>(false);
  const [isCarrierOpen, setIsCarrierOpen] = React.useState<boolean>(false);
  const [filtersState, setFiltersState] = React.useState<any>(null);
  //functions
  const onChange = (e: CheckboxChangeEvent) => {
    const id = e.target.id;
    const value = e.target.value;
    switch (id) {
        case "state":
            //set filtersState['state'][value] = !filtersState['state'][value];
            setFiltersState((prevState: any) => ({
                ...prevState,
                state: {
                    ...prevState.state,
                    [value]: !prevState.state[value],
                },
            }));
            break;
        case "year":
            setFiltersState((prevState:any) => ({
                ...prevState,
                year: {
                    ...prevState.year,
                    [value]: !prevState.year[value],
                }
            }));
            break;
        case "size":
            setFiltersState((prevState:any) => ({
                ...prevState,
                size:{
                    ...prevState.size,
                    [value]: !prevState.size[value],
                }
            }));
            break;
        case "carrier":
            setFiltersState((prevState:any) => ({
                ...prevState,
                carrier:{
                    ...prevState.carrier,
                    [value]: !prevState.carrier[value],
                }
            }));
            break;
        default:
            break;
    }
  };

  const toggleStateOpen = () => setIsStateOpen((prevState) => !prevState);
  const toggleYearOpen = () => setIsYearOpen((prevState) => !prevState);
  const toggleSizeOpen = () => setIsSizeOpen((prevState) => !prevState);
  const toggleCarrierOpen = () => setIsCarrierOpen((prevState) => !prevState);


  const handleFilter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    //FilterFunction(regionalDataStore, selectedFilters)
    dispatch(flight_actions.set_flight_filters(filtersState));
  };


    React.useEffect(() => {
        //console.log('filters_state',filtersState);
        //dispatch(flight_actions.set_flight_filters(filtersState));
    },[filtersState]);



    React.useEffect(() => {
        //console.log('filters_store',FiltersStore);
        setFiltersState(FiltersStore);
    }, [FiltersStore]);


  return (
    <>
      <div className="row">
        <div className="col-3">
            <button
                className="btn  btn-outline-light dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                onClick={toggleStateOpen}
            >
                State
            </button>
            {
                filtersState && (
                    <ul className={`dropdown-menu ${isStateOpen ? "show" : ""}`} aria-labelledby="dropdownMenuButton1" style={{ maxHeight: "300px", overflowY: "scroll" }}>
                    {Object.keys(filtersState['state']).map((key, index) => (
                        <li key={key}>
                            <Checkbox id="state" value={key} onChange={onChange}
                            checked = {filtersState['state'][key]}
                            >{stateMap[key] ? stateMap[key] : ""}</Checkbox>
                        </li>
                    ))}
                </ul>
                )
            }
        </div>
        <div className="col-3">
            <button
                className="btn btn-outline-light dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                onClick={toggleYearOpen}
            >
                Month
            </button>
            {
                filtersState && (
                    <ul className={`dropdown-menu ${isYearOpen ? "show" : ""}`} aria-labelledby="dropdownMenuButton1" style={{ maxHeight: "300px", overflowY: "scroll" }}>
                    {Object.keys(filtersState['year']).map((key, index) => (
                        <li key={key}>
                            <Checkbox checked={filtersState['year'][key]} id="year" value={key} onChange={onChange}>{yearDict[key]}</Checkbox>
                        </li>
                    ))}
                </ul>
                )
            }
        </div>
        {/* <div className="col-2">
            <button
                className="btn btn-outline-light dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                onClick={toggleSizeOpen}
            >
                Size
            </button>
            {
                filtersState && (
                    <ul className={`dropdown-menu ${isSizeOpen ? "show" : ""}`} aria-labelledby="dropdownMenuButton1" style={{ maxHeight: "300px", overflowY: "scroll" }}>
                    {Object.keys(filtersState['size']).map((key, index) => (
                        <li key={key}>
                            <Checkbox checked={filtersState['size'][key]} id="size" value={key} onChange={onChange}>{key}</Checkbox>
                        </li>
                    ))}
                    </ul>
                )
            }
        </div> */}
        <div className="col-3">
            <button
                className="btn btn-outline-light dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                onClick={toggleCarrierOpen}
            >
                Carrier
            </button>
            {
                filtersState && (
                    <ul className={`dropdown-menu ${isCarrierOpen ? "show" : ""}`} aria-labelledby="dropdownMenuButton1" style={{ maxHeight: "300px", overflowY: "scroll" }}>
                    {Object.keys(filtersState['carrier']).map((key, index) => (
                        <li key={key}>
                            <Checkbox checked={filtersState['carrier'][key]} id="carrier" value={key} onChange={onChange}>{carrierDict[key]}</Checkbox>
                        </li>
                    ))}
                    </ul>
                )
            }
        </div>
        <div className="col-3">
        <div className="d-flex justify-content-center">
            <div>
                <button id="apply__button" onClick={handleFilter} type="button">
                    Apply
                </button>
            </div>
        </div>

        </div>
      </div>
    </>
  );
}

export default MainFilter;
