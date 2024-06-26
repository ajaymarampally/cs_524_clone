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
    apiUrl = `https://vuwno7sb6s3fqpzqrjlrndjq540lkuvd.lambda-url.us-east-1.on.aws/api/airport_level_arrival?iata=${iata_arrival}`;
  }
  else if (iata_departure) {
    apiUrl = `https://vuwno7sb6s3fqpzqrjlrndjq540lkuvd.lambda-url.us-east-1.on.aws/api/airport_level_departure?iata=${iata_departure}`;
  }
    else if (state) {
    apiUrl = `https://vuwno7sb6s3fqpzqrjlrndjq540lkuvd.lambda-url.us-east-1.on.aws/api/state_info?state=${state}`;
  } else if (route) {
    apiUrl = `https://vuwno7sb6s3fqpzqrjlrndjq540lkuvd.lambda-url.us-east-1.on.aws/api/${route}`;
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
