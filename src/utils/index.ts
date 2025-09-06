export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function todayRangeUTC_BR() {
  const tz = "America/Sao_Paulo";

  const nowInBR = new Date(
    new Date().toLocaleString("en-US", { timeZone: tz })
  );

  const startLocal = new Date(
    nowInBR.getFullYear(),
    nowInBR.getMonth(),
    nowInBR.getDate(),
    0,
    0,
    0,
    0
  );
  const endLocal = new Date(
    nowInBR.getFullYear(),
    nowInBR.getMonth(),
    nowInBR.getDate() + 1,
    0,
    0,
    0,
    0
  );

  const startUTC = new Date(startLocal.toISOString());
  const endUTC = new Date(endLocal.toISOString());

  return { startUTC, endUTC };
}
