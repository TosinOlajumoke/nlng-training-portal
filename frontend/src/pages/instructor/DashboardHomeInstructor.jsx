// src/pages/instructor/InstructorDashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/DashboardCard";
import Charts from "../../components/Charts";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const DashboardHomeInstructor = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    courses: [],
    totalModules: 0,
    totalTrainees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorStats = async () => {
      if (!user || user.role !== "instructor") return;

      try {
        const res = await axios.get(`/api/users/instructor/${user.id}/dashboard-stats`);
        /**
         Expected response format:
         {
           totalCourses: 2,
           totalModules: 8,
           totalTrainees: 40,
           courses: [
             {
               id: 1,
               title: "Course A",
               modules_count: 5,
               modules: [
                 { id: 1, title: "Module 1", trainees_count: 10 },
                 { id: 2, title: "Module 2", trainees_count: 5 },
                 ...
               ]
             },
             ...
           ]
         }
        */
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching instructor stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorStats();
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;

  const cardsConfig = [
    { label: "Total Courses", key: "totalCourses", bold: true },
    { label: "Total Modules", key: "totalModules", bold: true },
    { label: "Total Trainees", key: "totalTrainees", bold: true },
  ];

  return (
    <div className="dashboard">
      <h2>Instructor Dashboard</h2>

      <div className="cards-grid">
        {cardsConfig.map((card, idx) => (
          <DashboardCard
            key={idx}
            label={card.label}
            count={<strong>{stats[card.key]}</strong>}
          />
        ))}
      </div>

      <h3>Modules per Course</h3>
      <Charts data={{ courses: stats.courses }} chartType="instructor" />
    </div>
  );
};

export default DashboardHomeInstructor;
