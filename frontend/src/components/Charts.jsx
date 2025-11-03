// components/Charts.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#007bff", "#00c49f", "#ffbb28", "#ff4444", "#9933ff", "#ff66cc"];

const Charts = ({ data = {}, chartType }) => {
  const dataVersion = useMemo(() => {
    try {
      if (!data) return "v0";
      const pick = [
        data.total_users, data.total_admins, data.total_instructors, data.total_trainees,
        data.total_contents, data.total_modules, data.total_trainees,
        data.total_courses_enrolled, data.total_modules_enrolled, data.total_modules_completed
      ].filter(Boolean).join("-");
      return pick || JSON.stringify(Object.keys(data));
    } catch {
      return "v0";
    }
  }, [data]);

  if (!data) return null;

  /** ADMIN */
  if (chartType === "admin") {
    const pieData = data.role_distribution || [
      { name: "Admins", value: data.total_admins || 0 },
      { name: "Instructors", value: data.total_instructors || 0 },
      { name: "Trainees", value: data.total_trainees || 0 },
    ];

    return (
      <div className="charts-grid">
        <motion.div
          key={`admin-pie-${dataVersion}`}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="chart-card"
        >
          <h4>User Distribution (Pie)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          key={`admin-bar-${dataVersion}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="chart-card"
        >
          <h4>User Distribution (Bar)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    );
  }

  /** INSTRUCTOR */
  if (chartType === "instructor") {
    const { total_contents = 0, total_modules = 0, total_trainees = 0, contents = [] } = data;
    const donutData = [
      { name: "Contents", value: total_contents },
      { name: "Modules", value: total_modules },
      { name: "Trainees", value: total_trainees },
    ];
    const allModuleTitles = Array.from(
      new Set(contents.flatMap(c => (c.modules || []).map(m => m.title)))
    );
    const stackedData = contents.map(c => {
      const obj = { content: c.title };
      (c.modules || []).forEach(m => {
        obj[m.title] = m.trainees_count || 0;
      });
      return obj;
    });

    return (
      <div className="charts-grid">
        <motion.div key={`instr-donut-${dataVersion}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }} className="chart-card">
          <h4>Summary (Donut)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                {donutData.map((entry, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div key={`instr-stacked-${dataVersion}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45, delay:0.05 }} className="chart-card">
          <h4>Trainees per Module per Content (Stacked)</h4>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: `${Math.max(600, contents.length * 120)}px`, height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="content" angle={-20} textAnchor="end" interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  {allModuleTitles.map((title, idx) => (
                    <Bar key={title} dataKey={title} stackId="a" fill={COLORS[idx % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /** TRAINEE */
  if (chartType === "trainee") {
    const {
      total_courses_enrolled = 0,
      total_modules_enrolled = 0,
      total_modules_completed = 0,
      total_courses_completed = 0,
      stacked_per_content = [],
    } = data;

    const donutData = [
      { name: "Courses Remaining", value: Math.max(0, total_courses_enrolled - total_courses_completed) },
      { name: "Courses Completed", value: total_courses_completed },
      { name: "Modules Remaining", value: Math.max(0, total_modules_enrolled - total_modules_completed) },
      { name: "Modules Completed", value: total_modules_completed },
    ];

    const stackedData = stacked_per_content.map(content => {
      const completed = (content.modules || []).filter(m => m.status === "completed").length;
      const inProgress = (content.modules || []).length - completed;
      return { content: content.content_title, Completed: completed, InProgress: inProgress };
    });

    return (
      <div className="charts-grid">
        <motion.div key={`trainee-donut-${dataVersion}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }} className="chart-card">
          <h4>Progress Summary (Donut)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                {donutData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div key={`trainee-stacked-${dataVersion}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45, delay:0.05 }} className="chart-card">
          <h4>Contents & Modules Completion (Clustered/Stacked)</h4>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: `${Math.max(600, stacked_per_content.length * 120)}px`, height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="content" angle={-20} textAnchor="end" interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Completed" stackId="a" fill="#00c49f" />
                  <Bar dataKey="InProgress" stackId="a" fill="#ff4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default Charts;
