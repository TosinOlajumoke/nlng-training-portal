import React from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#007bff", "#00c49f", "#ffbb28", "#ff4444"];

const Charts = ({ data }) => {
  if (!data) return null;

  const chartData = [
    { name: "Admins", value: Number(data.total_admins || 0) },
    { name: "Instructors", value: Number(data.total_instructors || 0) },
    { name: "Trainees", value: Number(data.total_trainees || 0) },
  ];

  return (
    <div className="charts-container">
      <div className="chart">
        <h4>User Role Distribution (Donut)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              label
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart">
        <h4>User Count by Role (Bar)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#007bff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
