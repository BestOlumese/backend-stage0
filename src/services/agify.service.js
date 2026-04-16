import axios from 'axios';

export const fetchAgePrediction = async (name) => {
  const url = `https://api.agify.io?name=${encodeURIComponent(name)}`;
  const response = await axios.get(url);
  const data = response.data;
  
  if (data.age === null) {
    throw { isExternalApiError: true, message: 'Agify returned an invalid response' };
  }
  
  return data;
};
