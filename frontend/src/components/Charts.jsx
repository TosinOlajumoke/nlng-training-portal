import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = ["#007bff", "#00c49f", "#ffbb28", "#ff4444", "#9933ff", "#ff66cc"];

const Charts = ({ data = {}, chartType }) => {
  if (!data) return null;

  const ChartContainer = ({ children, title }) => (
    <motion.div className="col-12 col-lg-6 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <h5 className="card-title mb-3">{title}</h5>
          <div style={{ width: "100%", height: 300 }}>{children}</div>
        </div>
      </div>
    </motion.div>
  );

  // ADMIN
  if (chartType === "admin") {
    const pieData = data.role_distribution || [];
    return (
      <div className="row">
        <ChartContainer title="User Distribution (Pie)">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="User Distribution (Bar)">
          <ResponsiveContainer>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  // INSTRUCTOR
  if (chartType === "instructor") {
    const donutData = [
      { name: "Contents", value: data.total_contents || 0 },
      { name: "Modules", value: data.total_modules || 0 },
      { name: "Trainees", value: data.total_trainees || 0 },
    ];
    const stackedData = (data.contents || []).map(c => ({
      content: c.content_title,
      ...Object.fromEntries(c.modules.map(m => [m.module_title, m.trainee_count])),
    }));
    const moduleTitles = [...new Set(stackedData.flatMap(d => Object.keys(d)).filter(k => k !== "content"))];

    return (
      <div className="row">
        <ChartContainer title="Summary (Donut)">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                {donutData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie><Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Trainees per Content per Module (Clustered)">
          <ResponsiveContainer>
            <BarChart data={stackedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="content" /><YAxis /><Tooltip /><Legend />
              {moduleTitles.map((t, i) => <Bar key={t} dataKey={t} fill={COLORS[i % COLORS.length]} />)}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  // TRAINEE
  // TRAINEE
if (chartType === "trainee") {
  const donutData = [
    { name: "Modules Enrolled", value: data.total_modules_enrolled || 0 },
    { name: "Contents Enrolled", value: data.total_contents_enrolled || 0 },
  ];

  // Prepare stacked data: each module gets its own key
  const stackedData = (data.contents || []).map(c => {
    const modulesObj = {};
    (c.modules || []).forEach(m => {
      modulesObj[m.module_title] = m.trainee_count || 1; // 1 if just marking enrollment
    });
    return {
      content: c.content_title,
      ...modulesObj,
    };
  });

  // Get all module titles across all contents for stacking
  const moduleTitles = [
    ...new Set(
      stackedData.flatMap(d => Object.keys(d)).filter(k => k !== "content")
    ),
  ];

  return (
    <div className="row">
      <ChartContainer title="Enrollment Summary (Donut)">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label
            >
              {donutData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Modules per Content (Stacked)">
        <ResponsiveContainer>
          <BarChart data={stackedData} stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="content" />
            <YAxis />
            <Tooltip />
            <Legend />
            {moduleTitles.map((mTitle, idx) => (
              <Bar
                key={mTitle}
                dataKey={mTitle}
                stackId="a"
                fill={COLORS[idx % COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

  return null;
};

export default Charts;
