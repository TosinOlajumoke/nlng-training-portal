import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Modal, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { FaBookOpen } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

// Export the component as requested
export const MyCoursesTrainee = () => {
    const { user } = useAuth(); // Get user details from context
    const traineeId = user?.id; // Assuming user context provides the ID

    const [enrolledModules, setEnrolledModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [selectedModuleTitle, setSelectedModuleTitle] = useState("");

    const fetchEnrolledModules = async () => {
        if (!traineeId) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/users/my-courses/${traineeId}`);
            setEnrolledModules(res.data);
        } catch (err) {
            toast.error("Failed to load your enrolled courses.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrolledModules();
    }, [traineeId]);

    const openContentModal = (content, moduleTitle) => {
        setSelectedContent(content);
        setSelectedModuleTitle(moduleTitle);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedContent(null);
    };

    // Helper to extract YouTube video ID from various URLs
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center page-content" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" />
                <p className="ms-3">Loading your courses...</p>
            </div>
        );
    }

    // Flatten modules and content into a single array of tiles
    const tilesData = [...enrolledModules].reverse().flatMap(module =>
        [...module.contents].reverse().map(content => ({
            moduleTitle: module.title,
            contentTitle: content.title,
            content: content,
            contentImage: content.image,
        }))
    );

    return (
        <div className="container py-4 page-content">
            <ToastContainer />
            <h2 className="mb-4">📚 My Enrolled Courses</h2>

            {tilesData.length === 0 ? (
                <p className="text-center text-muted">You are not currently enrolled in any content.</p>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {tilesData.map((tile, index) => (
                        <Col key={index}>
                            <Card
                                onClick={() => openContentModal(tile.content, tile.moduleTitle)}
                                className="h-100 shadow-sm course-tile"
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {/* 🖼️ CARD IMAGE DISPLAY */}
                                {tile.contentImage && (
                                    <Card.Img
                                        variant="top"
                                        src={STATIC_BASE_URL + tile.contentImage} // Uses the image path from the database
                                        style={{ height: '180px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Subtitle className="mb-1 text-muted">{tile.moduleTitle}</Card.Subtitle>
                                    <Card.Title className="text-primary">{tile.contentTitle}</Card.Title>
                                    <div className="d-flex align-items-center mt-3">
                                        <FaBookOpen className="me-2" />
                                        <span>View Content</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Content Detail Modal (90% screen size via custom CSS class) */}
            <Modal 
                show={showModal} 
                onHide={handleCloseModal} 
                size="xl" 
                centered 
                dialogClassName="modal-90-percent" // Custom class for 90% width
            >
                <Modal.Header closeButton>
                    <Modal.Title>{selectedModuleTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedContent && (
                        <Row>
                            {/* Left Side: Content Details (50%) */}
                            <Col md={6}>
                                <h4 style={{ color: "#006400", paddingBottom: "6px" }}>{selectedContent.title}</h4>

                                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContent.description}</p>
                            </Col>

                            {/* Right Side: Media (50%) - Image removed from here */}
                            <Col md={6} className="d-flex flex-column gap-3">
                                {/* YouTube Video */}
                                {selectedContent.video && getYouTubeId(selectedContent.video) && (
                                    <div style={{ flex: 1 }}>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${getYouTubeId(selectedContent.video)}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ minHeight: '300px' }}
                                        ></iframe>
                                    </div>
                                )}
                                {/* Fallback for direct video links (non-YouTube) */}
                                {selectedContent.video && !getYouTubeId(selectedContent.video) && (
                                    <video width="100%" controls style={{ maxHeight: '100%', flex: 1 }}>
                                        <source src={selectedContent.video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MyCoursesTrainee; // Standard export
// export { MyCoursesTrainee }; // Named export (also requested)