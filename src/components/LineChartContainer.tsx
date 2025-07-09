'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { time: "10:00", value: 98 },
  { time: "10:30", value: 92 },
  { time: "11:00", value: 85 },
  { time: "11:30", value: 88 },
  { time: "12:00", value: 95 },
];

export default function LineChartContainer() {
  return (
    <LineChart width={700} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="value"
        stroke="#3b82f6"
        activeDot={{ r: 8 }}
      />
    </LineChart>
  );
}
