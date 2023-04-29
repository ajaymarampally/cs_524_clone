import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// interface FlightFilters {
//   [key: string]: string[];
// }
interface FlightState {
  searchTerm: string;
  selectedToggle: string;
  selectedLegend: string;
  LegendMinMax: number[];
  colorScale: any;
  selectedFilters: any;
  regionDelayData: any;
  filteredData: any;
  chartData1: any;
  chartData2: any;
}

const initialState: FlightState = {
    searchTerm: '', 
    selectedToggle: 'arrival',
    selectedLegend: 'arrival',
    LegendMinMax: [0, 0],
    colorScale: null,
    selectedFilters: {
      "state": {},
      "year": {},
      "size": {},
      "carrier": {},
      "direction": {"departures": true, "arrival": false},
    },
    regionDelayData: {},
    filteredData: {},
    chartData1: {},
    chartData2: {}
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
    set_flight_filters(state, action: PayloadAction<any>) {
      state.selectedFilters = action.payload;
    },
    set_flight_region_delay_data(state, action: PayloadAction<any>) {
      state.regionDelayData = action.payload;
    },
    set_flight_filtered_data(state, action: PayloadAction<any>) {
      state.filteredData = action.payload;
    },
    set_flight_chart_data1(state, action: PayloadAction<any>) {
      state.chartData1 = action.payload;
    },
    set_flight_chart_data2(state, action: PayloadAction<any>) {
      state.chartData2 = action.payload;
    },
    reset_flight_slice(state) {
      state.searchTerm = '';
      state.selectedToggle = 'arrival';
      state.selectedLegend = 'arrival';
      state.LegendMinMax = [0, 0];
      state.colorScale = null;
      state.selectedFilters = {
        "state": {},
        "year": {},
        "size": {},
        "carrier": {},
        "direction": {"departures": true, "arrival": false},
      }
      state.regionDelayData = {};
      state.filteredData = {};
      state.chartData1 = {};
      state.chartData2 = {};
    }
  },
});

export const flight_actions = flightSlice.actions;

export default flightSlice;
 