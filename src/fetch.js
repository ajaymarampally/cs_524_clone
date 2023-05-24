const fs = require('fs');
const axios = require('axios');

const url = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';
const filePath = 'us-states.geojson';

axios.get(url, { responseType: 'json' }) // Specify the response type as JSON
  .then((response) => {
    const geojson = JSON.stringify(response.data); // Convert the data to a string
    fs.writeFileSync(filePath, geojson);
  })
  .catch((error) => {
    console.error('Error fetching us-states.geojson:', error.message);
  });
