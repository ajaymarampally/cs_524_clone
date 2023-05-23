// netlify/functions/proxy.js

exports.handler = async (event) => {
  const { queryStringParameters } = event;

  if (!queryStringParameters) {
    return {
      statusCode: 400,
      body: 'Missing query parameters',
    };
  }

  const { iata, state , route } = queryStringParameters;

  let apiUrl;
  if (iata) {
    apiUrl = `http://18.216.87.63:3000/api/airport_level_departure?iata=${iata}`;
  } else if (state) {
    apiUrl = `http://18.216.87.63:3000/api/state_info?state=${state}`;
  } else if (route) {
    apiUrl = `http://18.216.87.63:3000/api/${route}`;
  } else {
    return {
      statusCode: 400,
      body: 'Missing query parameters',
    };
  }

  try {
    const fetch = await import('node-fetch');
    const response = await fetch.default(apiUrl);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred' }),
    };
  }
};
