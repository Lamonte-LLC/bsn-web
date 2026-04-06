export const formatInches = (inches: number): string => {
  if (inches <= 0) {
    return '0"'; // Return 0 for non-positive heights
  }
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.floor(inches % 12);
  return `${feet}'${remainingInches}"`;
};
