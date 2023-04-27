import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import flightSlice from "../redux/slices/flightSlice";
import FilterComponent from "./FilterComponent";

//interface
interface SearchBarProps {
  setMapLocation: (search: string) => void;
}

function SearchBar(props: SearchBarProps) {
  const [search, setSearch] = React.useState<string>("");
  const searchRedux = useSelector((state: any) => state.flight.value);

  //redux
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(flightSlice.actions.set_flight_slice(search));
  }, [dispatch, search, searchRedux]);

  //functions

  const setSearchTerm = (e: any) => {
    //console.log(e.target.value);
    setSearch(e.target.value);
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setMap();
    }
  };



  const setMap = () => {
    //console.log("setMap called");
    //check if the length of the search is exactly 3
    if (search.length !== 3) {
      alert("Please enter a valid airport code"); 
      return;
    }
    props.setMapLocation(search);

  };

  return (
    <>
      <div id="search__container">
        <input
          type="text"
          id="search__input"
          placeholder="Search for a place"
          value={search}
          onChange={setSearchTerm}
          onKeyPress={handleEnter}
        />
        <button 
          id="search__button"
          onClick={() => {
            setMap();
          }}
        >
          Search
        </button>
      </div>
    </>
  );
}

export default SearchBar;
