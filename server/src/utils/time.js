const UNITS_IN_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export const parseDurationToMs = (value) => {
  if (typeof value !== "string") {
    return 7 * UNITS_IN_MS.d;
  }

  const trimmedValue = value.trim();

  if (/^\d+$/.test(trimmedValue)) {
    return Number(trimmedValue) * UNITS_IN_MS.s;
  }

  const match = trimmedValue.match(/^(\d+)(ms|s|m|h|d)$/i);

  if (!match) {
    return 7 * UNITS_IN_MS.d;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  return amount * UNITS_IN_MS[unit];
};
