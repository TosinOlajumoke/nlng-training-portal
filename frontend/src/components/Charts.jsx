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
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#9933ff" />
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

  // Extract unique modules and contents
  const modules = new Set();
  const contents = new Set();

  (data.contents || []).forEach((c) => {
    contents.add(c.content_title);
    c.modules.forEach((m) => modules.add(m.module_title));
  });

  // Transform data for stacked column chart
  const stackedData = Array.from(modules).map((module) => {
    const row = { module };
    (data.contents || []).forEach((c) => {
      const match = c.modules.find((m) => m.module_title === module);
      row[c.content_title] = match ? match.trainee_count : 0;
    });
    return row;
  });

  const contentTitles = Array.from(contents);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip bg-light p-2 rounded shadow-sm"
          style={{
            border: "1px solid #ccc",
            minWidth: "180px",
          }}
        >
          <p className="fw-bold mb-1 text-success">{`Module: ${label}`}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="mb-0"
              style={{ color: entry.color }}
            >{`${entry.name}: ${entry.value} trainee${entry.value === 1 ? "" : "s"}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="row">
      {/* === Donut Summary === */}
      <ChartContainer title="Summary (Donut)">
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
              {donutData.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* === Taller Stacked Column Chart === */}
      <ChartContainer title="Trainees per Module (Stacked by Content)">
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={stackedData}
            margin={{ top: 30, right: 30, left: 10, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="module"
              angle={-15}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,100,0,0.1)" }} />
            <Legend />
            {contentTitles.map((content, i) => (
              <Bar
                key={content}
                dataKey={content}
                stackId="a"
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}


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
