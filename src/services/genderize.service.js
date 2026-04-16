import axios from 'axios';

export const fetchGenderPrediction = async (name) => {
  const url = `https://api.genderize.io?name=${encodeURIComponent(name)}`;
  const response = await axios.get(url);
  const data = response.data;
  
  if (data.gender === null || data.count === 0) {
    throw { isExternalApiError: true, message: 'Genderize returned an invalid response' };
  }
  
  return data;
};
