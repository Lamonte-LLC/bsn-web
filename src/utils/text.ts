export const truncateText = (
  text: string,
  maxLength: number = 100,
  ellipsis: string = '...',
): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + ellipsis;
};

export const getFirstWord = (text: string): string => {
  const words = text.trim().split(/\s+/);
  return words.length > 0 ? words[0] : '';
};

export const getInitials = (fullName: string): string => {
  const words = fullName.trim().split(/\s+/);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];
  return words[0][0].toUpperCase() + '. ' + words[words.length - 1];
};
