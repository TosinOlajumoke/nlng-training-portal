import React from "react";
import PropTypes from "prop-types";

const DashboardCard = ({ label, count }) => {
  return (
    <div className="dashboard-card">
      <div className="dashboard-label">{label}</div>
      <div className="dashboard-count">{count}</div>
    </div>
  );
};

DashboardCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default DashboardCard;
