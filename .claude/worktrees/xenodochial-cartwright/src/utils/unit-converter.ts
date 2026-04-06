export const kilogramToPounds = (kg?: number): number => {
  if (kg === null || kg === undefined) {
    return 0; // Return 0 for null or undefined weights
  }
  if (kg <= 0) {
    return 0; // Return 0 for non-positive weights
  }
  return kg * 2.20462;
};

export const centimeterToInches = (cm?: number): number => {
  if (cm === null || cm === undefined) {
    return 0; // Return 0 for null or undefined heights
  }
  if (cm <= 0) {
    return 0; // Return 0 for non-positive heights
  }
  return cm / 2.54;
};
