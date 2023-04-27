import React from 'react'
import MapComponent from './MapComponent'
import '../App'
import { useDispatch } from 'react-redux';
import { flight_actions } from '../redux/slices/flightSlice';

function Home() {
  //redux hooks
const dispatch = useDispatch();


  React.useEffect(() => {
    dispatch(flight_actions.reset_flight_slice());
  }, [])

  return (
    <>
        <div>
            <div className='map__container'>
                <MapComponent />
            </div>
        </div>
    </>
  )
}

export default Home