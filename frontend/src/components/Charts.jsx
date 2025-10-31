import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#007bff", "#00c49f", "#ffbb28", "#ff4444", "#9933ff", "#ff66cc"];

const Charts = ({ data, chartType = "admin" }) => {
  if (!data) return null;

  if (chartType === "admin") {
    const chartData = [
      { name: "Admins", value: Number(data.total_admins || 0) },
      { name: "Instructors", value: Number(data.total_instructors || 0) },
      { name: "Trainees", value: Number(data.total_trainees || 0) },
    ];

    return (
      <div className="charts-container">
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
  }

  if (chartType === "instructor") {
    // Build stacked bar chart: X-axis = courses, Y-axis = number of trainees
    // Each module is a separate bar segment in the stack
    const courses = data.courses || [];

    // Collect all module names
    const allModuleNames = Array.from(
      new Set(courses.flatMap(course => course.modules?.map(mod => mod.title) || []))
    );

    // Prepare chart data per course
    const chartData = courses.map(course => {
      const entry = { course: course.title };
      course.modules?.forEach(mod => {
        entry[mod.title] = mod.trainees_count;
      });
      return entry;
    });

    return (
      <div className="charts-container">
        <div className="chart">
          <h4>Trainees per Module per Course (Stacked)</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" angle={-20} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              {allModuleNames.map((moduleName, index) => (
                <Bar
                  key={moduleName}
                  dataKey={moduleName}
                  stackId="traineesStack"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
};

export default Charts;
