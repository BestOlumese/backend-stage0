export const getAgeGroup = (age) => {
  if (age === null || age === undefined) return null;
  if (age >= 0 && age <= 12) return 'child';
  if (age >= 13 && age <= 19) return 'teenager';
  if (age >= 20 && age <= 59) return 'adult';
  if (age >= 60) return 'senior';
  return null;
};

export const getHighestProbabilityCountry = (countries) => {
  if (!countries || !Array.isArray(countries) || countries.length === 0) return null;
  return countries.reduce((highest, current) => {
    return (current.probability > highest.probability) ? current : highest;
  }, countries[0]);
};
