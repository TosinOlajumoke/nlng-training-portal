import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const DashboardCard = ({ label, count, className = "", subtitle }) => {
  const keyForAnim = typeof count === "object" ? JSON.stringify(count) : String(count);

  return (
    <motion.div
      key={keyForAnim}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`dashboard-card ${className}`}
    >
      <div className="dashboard-card-inner">
        <div className="dashboard-label">{label}</div>
        <div className="dashboard-count">{count}</div>
        {subtitle && <div className="dashboard-subtitle">{subtitle}</div>}
      </div>
    </motion.div>
  );
};

DashboardCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  subtitle: PropTypes.string,
};

export default DashboardCard;
