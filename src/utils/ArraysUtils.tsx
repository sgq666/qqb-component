export const groupBy = (array: any[], keyFn: (item: any) => string) => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
};
