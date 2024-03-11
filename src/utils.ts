export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const removeFromArray = <T>(arr: T[], value: T) => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
};
