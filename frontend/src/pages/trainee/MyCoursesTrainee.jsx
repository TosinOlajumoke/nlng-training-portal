import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const MyCoursesTrainee = () => {
  const { user, token } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      if (!user?.id) return; // Wait for user to be loaded
      try {
        const res = await fetch(`/api/trainee/my-courses/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch trainee courses");
        const data = await res.json();
        setModules(data);
      } catch (err) {
        console.error("Error fetching trainee courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user, token]);

  if (loading) return <div className="page-content">Loading...</div>;
  if (!modules.length) return <div className="page-content">No courses enrolled yet.</div>;

  return (
    <div className="page-content">
      {modules.map((module) =>
        module.contents.map((content) => (
          <div
            key={content.content_id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
              width: "200px",
              cursor: "pointer",
            }}
            onClick={() => setSelectedContent(content)}
          >
            <img
              src={content.image || "/uploads/default/default-avatar.png"}
              alt={content.content_title}
              style={{ width: "100%", height: "100px", objectFit: "cover" }}
            />
            <h4>{module.module_title}</h4>
            <p>{content.content_title}</p>
          </div>
        ))
      )}

      {/* Modal */}
      {selectedContent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setSelectedContent(null)}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              background: "#fff",
              display: "flex",
              flexDirection: "row",
            }}
            onClick={(e) => e.stopPropagation()} // prevent modal close on content click
          >
            {/* Left side: title + description */}
            <div style={{ width: "50%", padding: "20px", overflowY: "auto" }}>
              <h2>{selectedContent.content_title}</h2>
              <p>{selectedContent.description}</p>
            </div>

            {/* Right side: image + video */}
            <div style={{ width: "50%", padding: "20px" }}>
              <img
                src={selectedContent.image || "/uploads/default/default-avatar.png"}
                alt={selectedContent.content_title}
                style={{ width: "100%", height: "50%", objectFit: "cover" }}
              />
              {selectedContent.video && (
                <iframe
                  width="100%"
                  height="50%"
                  src={selectedContent.video}
                  title={selectedContent.content_title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesTrainee;
