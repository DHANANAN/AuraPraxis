/**
 * Humanizer Tricks to bypass AI detection.
 * Inserts zero-width spaces and other invisible characters.
 */
export const applyHumanizerTricks = (text: string): string => {
  // Invisible characters
  const ZWSP = '\u200B'; // Zero-width space
  const ZWNJ = '\u200C'; // Zero-width non-joiner
  const ZWJ = '\u200D';  // Zero-width joiner
  
  const tricks = [ZWSP, ZWNJ, ZWJ];
  
  // Split by words and insert invisible characters randomly
  return text.split(' ').map(word => {
    if (word.length > 2) {
      const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];
      const splitIndex = Math.floor(Math.random() * (word.length - 1)) + 1;
      return word.slice(0, splitIndex) + randomTrick + word.slice(splitIndex);
    }
    return word;
  }).join(' ');
};
