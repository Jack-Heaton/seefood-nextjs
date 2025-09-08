export const euclideanDistance = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error("Arrays must be of equal length");
  }

  const squaredDifferences = a.map((value, index) => {
    const difference = value - b[index];
    return difference * difference;
  });

  const sumOfSquaredDifferences = squaredDifferences.reduce(
    (sum, value) => sum + value,
    0
  );
  return Math.sqrt(sumOfSquaredDifferences);
};

export const doMath = (
  a: number[],
  b: number[],
  c: number[],
  operator: "+" | "-"
) => {
  const result = euclideanDistance(
    a.map((value, index) =>
      operator === "+" ? value + b[index] : value - b[index]
    ),
    c
  );

  console.log(result);

  return result;
};
