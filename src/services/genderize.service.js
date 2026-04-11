import axios from "axios";

export const fetchGenderPrediction = async (name) => {
  const url = `https://api.genderize.io?name=${encodeURIComponent(name)}`;
  const response = await axios.get(url);
  return response.data;
};
