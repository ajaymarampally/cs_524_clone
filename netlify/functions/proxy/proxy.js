// netlify/functions/proxy.js

exports.handler = async (event) => {
  const { queryStringParameters } = event;

  if (!queryStringParameters) {
    return {
      statusCode: 400,
      body: 'Missing query parameters',
    };
  }

  const { iata_arrival,iata_departure, state , route } = queryStringParameters;

  let apiUrl;
  if (iata_arrival) {
    apiUrl = `https://aq8jqh7q97.execute-api.us-east-1.amazonaws.com/dev/api/airport_level_arrival?iata=${iata_arrival}`;
  }
  else if (iata_departure) {
    apiUrl = `https://aq8jqh7q97.execute-api.us-east-1.amazonaws.com/dev/api/airport_level_departure?iata=${iata_departure}`;
  }
    else if (state) {
    apiUrl = `https://aq8jqh7q97.execute-api.us-east-1.amazonaws.com/dev/api/state_info?state=${state}`;
  } else if (route) {
    apiUrl = `https://aq8jqh7q97.execute-api.us-east-1.amazonaws.com/dev/api/${route}`;
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
