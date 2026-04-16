import axios from 'axios';

export const fetchNationalityPrediction = async (name) => {
  const url = `https://api.nationalize.io?name=${encodeURIComponent(name)}`;
  const response = await axios.get(url);
  const data = response.data;
  
  if (!data.country || data.country.length === 0) {
    throw { isExternalApiError: true, message: 'Nationalize returned an invalid response' };
  }
  
  return data;
};
