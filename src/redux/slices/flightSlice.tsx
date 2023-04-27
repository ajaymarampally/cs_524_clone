import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface FlightFilters {
  [key: string]: string[];
}
interface FlightState {
  searchTerm: string;
  selectedToggle: string;
  selectedLegend: string;
  LegendMinMax: number[];
  colorScale: any;
  selectedFilters: FlightFilters;
  regionDelayData: any;
  filteredData: any;
}

const initialState: FlightState = {
    searchTerm: '', 
    selectedToggle: 'arrival',
    selectedLegend: 'arrival',
    LegendMinMax: [0, 0],
    colorScale: null,
    selectedFilters: {
      "state": [],
      "year": [],
      "size": [],
      "carrier": [],
    },
    regionDelayData: {},
    filteredData: {}
};


const flightSlice = createSlice({
  name: 'flight',
  initialState,
  reducers: {
    set_flight_slice(state, action: PayloadAction<string>) {
        state.searchTerm = action.payload;
    },
    set_flight_toggle(state, action: PayloadAction<string>) {
        state.selectedToggle = action.payload;
    },
    set_flight_legend(state, action: PayloadAction<string>) {
        state.selectedLegend = action.payload;
    },
    set_flight_legend_minmax(state, action: PayloadAction<number[]>) {
        state.LegendMinMax = action.payload;
    },
    set_flight_color_scale(state, action: PayloadAction<any>) {
        state.colorScale = action.payload;
    },
    set_flight_filters(state, action: PayloadAction<FlightFilters>) {
      state.selectedFilters = action.payload;
    },
    set_flight_region_delay_data(state, action: PayloadAction<any>) {
      state.regionDelayData = action.payload;
    },
    set_flight_filtered_data(state, action: PayloadAction<any>) {
      state.filteredData = action.payload;
    },
    reset_flight_slice(state) {
      state.searchTerm = '';
      state.selectedToggle = 'arrival';
      state.selectedLegend = 'arrival';
      state.LegendMinMax = [0, 0];
      state.colorScale = null;
      state.selectedFilters = {
        "state": [],
        "year": [],
        "size": [],
        "carrier": [],
      }
      state.regionDelayData = {};
      state.filteredData = {};
    }
  },
});

export const flight_actions = flightSlice.actions;

export default flightSlice;
 