const express = require('express');
const app = express();
const cors = require('cors'); // import the cors package
const { Pool } = require('pg');
const compression = require('compression');

app.use(compression());


const pool = new Pool({
  user: 'flight_master',
  host: 'flightanalytics.cdrqakbhvcei.us-east-1.rds.amazonaws.com',
  database: 'flight-analytics',
  password: 'Ya?polk2433',
  port: 5432
});

app.use(cors()); // use the cors middleware

app.get('/', function(req, res) {
  res.send('Flight Analytics Server');
});

app.get('/api/flights', function(req, res) {
  pool.query('SELECT * FROM flights', (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  });
});

app.get('/api/airports', function(req, res) {
  pool.query('SELECT * FROM us_airports', (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  });
});

const REGION_DEPARTURE_DELAY = "SELECT fs.year_month,fs.unique_carrier,a.iso_region, a.size, ROUND(avg(fs.dep_delay)::NUMERIC,3) dep_delay FROM flight_summary fs, us_airports a where fs.origin = a.iata_code group by 1,2,3,4"

app.get('/api/departure_delay', function(req, res) {
  pool.query(REGION_DEPARTURE_DELAY, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  });
});

const REGION_ARRIVAL_DELAY = "SELECT fs.year_month,fs.unique_carrier,a.iso_region, a.size, ROUND(avg(fs.arr_delay)::NUMERIC,3) arr_delay FROM flight_summary fs, us_airports a where fs.destination = a.iata_code group by 1,2,3,4"

app.get('/api/arrival_delay', function(req, res) {
  pool.query(REGION_ARRIVAL_DELAY, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  });
});

const REGION_DELAY = "SELECT fs.year_month,fs.unique_carrier,a.iso_region, a.size, 'dep' delay_type ,ROUND(avg(fs.dep_delay)::NUMERIC,3) delay FROM  flight_summary fs, us_airports a where fs.origin = a.iata_code group by 1,2,3,4 UNION SELECT  fs.year_month,fs.unique_carrier,a.iso_region, a.size,'arr' delay_type, ROUND(avg(fs.arr_delay)::NUMERIC,3) delay FROM  flight_summary fs, us_airports a where fs.destination = a.iata_code group by 1,2,3,4"

app.get('/api/region_delay', function(req, res) {
  pool.query(REGION_DELAY, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  });
});

const STATE_LEVEL = "select a.iata_code, fs.year_month, a.airport_name, a.size, a.latitude, a.longitude, a.iso_region,'dep' delay_type, ROUND(avg(fs.dep_delay)::NUMERIC,3) delay, ROUND(avg(fs.taxi_out)::NUMERIC,3) taxi from flight_summary fs, us_airports a where a.iata_code = fs.origin group by 1,2,3,4,5,6,7,8 UNION select a.iata_code, fs.year_month, a.airport_name, a.size, a.latitude, a.longitude, a.iso_region, 'arr' delay_type, ROUND(avg(fs.arr_delay)::NUMERIC,3) delay, ROUND(avg(fs.taxi_in)::NUMERIC,3) taxi from flight_summary fs, us_airports a where a.iata_code = fs.destination group by 1,2,3,4,5,6,7,8"

app.get('/api/state_data', function(req, res) {
  pool.query(STATE_LEVEL, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  });
});

app.get('/api/state_info', function(req, res) {
  const state = req.query.state;
  const STATE_INFO = `select a.iso_region,a.airport_name,a.iata_code,a.size, a.latitude, a.longitude,'dep' direction,ROUND(avg(dep_delay)::NUMERIC, 3) delay, ROUND(avg(taxi_out)::NUMERIC, 3) taxi, ROUND(sum(flight_count)::NUMERIC,3) total_count
  from flight_summary fs, us_airports a
  where
  a.iso_region = $1
  and fs.origin = a.iata_code
  and a.size = 'large'
  group by 1,2,3,4,5,6
  UNION
  select a.iso_region,a.airport_name,a.iata_code,a.size  a.latitude, a.longitude,'arr' direction, ROUND(avg(arr_delay)::NUMERIC, 3) delay, ROUND(avg(taxi_in)::NUMERIC, 3) taxi, ROUND(sum(flight_count)::NUMERIC,3) total_count
  from flight_summary fs, us_airports a
  where
  a.iso_region = $1
  and fs.destination = a.iata_code
  and a.size = 'large'
  group by 1,2,3,4,5,6
  `;

  pool.query(STATE_INFO, [state], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  });
});

app.get('/api/airport_level_departure',function(req,res){
  const iata_code = req.query.iata;
 const AIRPORT_LEVEL_DEPARTURE = `select to_char(to_date(year_month,'YYYY-MM'),'Month'),ROUND(delay::NUMERIC,2) delay,ROUND(taxi::NUMERIC,2) taxi
  from (
      select year_month, avg(arr_delay) delay, avg(taxi_in) taxi
      from flight_summary
      where origin = $1
      group by 1
      order by 1
    )x
  `;
  pool.query(AIRPORT_LEVEL_DEPARTURE, [iata_code], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  }
  );
})

app.get('/api/airport_level_arrival',function(req,res){

  const iata_code = req.query.iata;
  const AIRPORT_LEVEL_ARRIVAL = `select to_char(to_date(year_month,'YYYY-MM'),'Month'),ROUND(delay::NUMERIC,2) delay,ROUND(taxi::NUMERIC,2) taxi
  from (
    select year_month, avg(dep_delay) delay, avg(taxi_out) taxi
    from flight_summary
    where destination = $1
    group by 1
    order by 1
  )x
  `;

  pool.query(AIRPORT_LEVEL_ARRIVAL, [iata_code], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result.rows);
  }
  );
})

app.listen(3000, function() {
  console.log('Express server listening on port 3000');
});


