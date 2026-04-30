/** Demo OHLC + volume for trading-agent charts (replace with live feeds later). */
export type Candle = { t: string; o: number; h: number; l: number; c: number; v: number };

export const MOCK_CANDLES: Candle[] = [
  { t: "Mon", o: 100, h: 104, l: 98, c: 102, v: 1200 },
  { t: "Tue", o: 102, h: 106, l: 101, c: 105, v: 980 },
  { t: "Wed", o: 105, h: 105, l: 99, c: 100, v: 1500 },
  { t: "Thu", o: 100, h: 108, l: 99, c: 107, v: 2100 },
  { t: "Fri", o: 107, h: 110, l: 104, c: 106, v: 1750 },
  { t: "Sat", o: 106, h: 109, l: 103, c: 108, v: 890 },
  { t: "Sun", o: 108, h: 112, l: 106, c: 111, v: 1320 },
];

export const MOCK_PNL = [
  { t: "W1", pnl: 120 },
  { t: "W2", pnl: -45 },
  { t: "W3", pnl: 210 },
  { t: "W4", pnl: 180 },
  { t: "W5", pnl: -30 },
  { t: "W6", pnl: 340 },
  { t: "W7", pnl: 410 },
  { t: "W8", pnl: 385 },
];
