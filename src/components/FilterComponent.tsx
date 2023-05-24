import React, { useState } from 'react';
import filter from '../img/filter.svg';
import timeline from '../img/timeline.png';
import arrival from '../img/arrivals.png';
import departure from '../img/plane.png';
import flight from '../img/flight.png';

function FilterComponent() {
  const [showFilter, setShowFilter] = useState(false);
  const [propContent, setPropContent] = useState(null);
  const handleFilterClick = () => {
    setShowFilter(!showFilter);
  };

  const handleFilterOptionClick = (value:any) => {
    //send as a prop to the FilterProps component\
    setPropContent(value);
    //pass to the parent component

  };


  return (
    <>
      <div className="filter__container">
        {/* <img src={filter} alt="filter" id="filter__icon" onClick={handleFilterClick} /> */}
        {showFilter && (
          <div className="filter__options">
            <div>
              <img src={timeline} alt='timeline' onClick={()=>handleFilterOptionClick("timeline")} />
            </div>
            <div>
              <img src={arrival} alt='arrival' onClick={()=>handleFilterOptionClick("arrival")} />
            </div>
            <div>
              <img src={departure} alt='departure' onClick={()=>handleFilterOptionClick("departure")} />
            </div>
            <div>
              <img src={flight} alt='flight' onClick={()=>handleFilterOptionClick("flight")} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FilterComponent;