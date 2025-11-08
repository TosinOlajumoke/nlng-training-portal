import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const DashboardCard = ({ label, count }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="card shadow-sm text-center p-3 h-100"
  >
    <div className="card-body">
      <h6 className="text-secondary">{label}</h6>
      <h4 style={{ color: "#006400" }}>{count}</h4>
    </div>
  </motion.div>
);

DashboardCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default DashboardCard;

