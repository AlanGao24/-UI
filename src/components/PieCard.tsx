'use client';

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ff7f7f', '#ffc658', '#8dd1e1', '#82ca9d', '#d0ed57'];

type PieCardProps = {
  title: string;
  data: { name: string; value: number }[];
  colorMap?: Record<string, string>;
};

export default function PieCard({ title, data, colorMap = {} }: PieCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow w-full flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
      <div className="flex justify-center items-center">
        <ResponsiveContainer width={250} height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}      // 取消线
              label={({ value }) => value}   // 只显示数字
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorMap[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, _props) => {
                const total = data.reduce((sum, d) => sum + d.value, 0);
                const percent = ((value / total) * 100).toFixed(1);
                return [`${value} (${percent}%)`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="ml-6 space-y-2 text-sm">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: colorMap[entry.name] || COLORS[index % COLORS.length] }}
              />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
