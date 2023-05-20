import React, { useEffect, useState } from "react";
import MuiToggleButton from "@mui/material/ToggleButton";
import MuiToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reduxRoot";
import { flight_actions } from "../redux/slices/flightSlice";

interface FilterProps {
  props_type: string;
}

function FilterPropsComponent(props: FilterProps) {
  //constants
  const [alignment, setAlignment] = React.useState("departure");
  const [ActiveToggle, setActiveToggle] = useState("departure");
  const ToggleButton = styled(MuiToggleButton)(() => ({
    "&.Mui-selected": {
      color: "white",
      backgroundColor: "#2b67c1",
    },
  }));

  const ToggleButtonGroup = styled(MuiToggleButtonGroup)(() => ({
    "& .MuiToggleButtonGroup-grouped": {
      backgroundColor: "white",
    },
  }));

  //redux hooks
  const dispatch = useDispatch();


  //functions
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: any
  ) => {
    setAlignment(newAlignment);
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLInputElement;
    setActiveToggle(target.value);
  };

  useEffect(() => {
    dispatch(flight_actions.set_flight_toggle(ActiveToggle));
  }, [ActiveToggle]);



  return (
    <>
      {props.props_type === "timeline" && (
        <div className="props__container">
          <div className="props__options">
            <ToggleButtonGroup
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton onClick={handleButtonClick} value="arrival">
                Arrival
              </ToggleButton>
              <ToggleButton onClick={handleButtonClick} value="departure">
                Departures
              </ToggleButton>
            </ToggleButtonGroup>{" "}
          </div>
        </div>
      )}
      {/* {props.props_type === "arrivals" && (
        <div className="props__container">
          <div className="props__options">
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton onClick={handleButtonChange} color="success" id="toggle__button" value="arrival">Arrival</ToggleButton>
              <ToggleButton onClick={handleButtonChange} color="success" id="toggle__button" value="departure">Departures</ToggleButton>
            </ToggleButtonGroup>{" "}
          </div>
        </div>
      )}
      {props.props_type === "departures" && (
        <div className="props__container">
          <div className="props__options">
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton color="success" id="toggle__button" value="arrival">Arrival</ToggleButton>
              <ToggleButton color="success" id="toggle__button" value="departure">Departures</ToggleButton>
            </ToggleButtonGroup>{" "}
          </div>
        </div>
      )}
      {props.props_type === "airports" && (
        <div className="props__container">
          <div className="props__options">
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton color="success" id="toggle__button" value="arrival">Arrival</ToggleButton>
              <ToggleButton color="success" id="toggle__button" value="departure">Departures</ToggleButton>
            </ToggleButtonGroup>{" "}
          </div>
        </div>
      )} */}
    </>
  );
}

export default FilterPropsComponent;
