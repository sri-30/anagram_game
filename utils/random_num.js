export function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

export function getRndChoice(choices) {
  let r = Math.random();
  if (r < 0.5) {
    return choices[0];
  }
  else {
    return choices[1];
  }
}