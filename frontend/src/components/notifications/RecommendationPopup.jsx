import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { FiStar } from "react-icons/fi";

const RecommendationPopup = ({ show, onClose, darkMode, onSaveRating }) => {
  const [rating, setRating] = useState(4);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const messages = {
    1: "⭐ very bad (25%)",
    2: "⭐⭐ bad (50%)",
    3: "⭐⭐⭐ good (75%)",
    4: "⭐⭐⭐⭐ very good (100%)",
  };

  useEffect(() => {
    setMessage(messages[rating]);
  }, [rating]);

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setMessage(messages[newRating]);
  };

  // Handle save rating and close the popup
  const handleSaveAndClose = async () => {
    const percentageRating = rating * 25;
    
    try {
      await onSaveRating(percentageRating); 
      onClose();
    } catch (error) {
      console.error("Error saving rating:", error);
      setError("Could not save your rating. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header 
        closeButton 
        style={{
          backgroundColor: darkMode ? "#2c2c2c" : "#f8f9fa",
          color: darkMode ? "#ffffff" : "#000000", 
        }}
      >
        <Modal.Title>
          <FiStar size={25} style={{ color: darkMode ? "#f39c12" : "#2c2c2c", marginRight: "8px" }} />
          Recommended for You!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          color: darkMode ? "#ffffff" : "#000000",
          backgroundColor: darkMode ? "#2c2c2c" : "#ffffff",
          padding: "20px", 
        }}
      >
        {error ? (
          <p style={{ color: "red" }}>{error}</p> 
        ) : (
          <p>{message}</p>
        )}
        <div className="d-flex justify-content-center mt-3">
          {[1, 2, 3, 4].map((star) => (
            <FiStar
              key={star}
              size={30}
              onClick={() => handleRatingChange(star)}
              style={{
                cursor: "pointer",
                color: star <= rating ? "#f39c12" : "#ccc",
                marginRight: "5px",
                transition: "color 0.3s ease",
              }}
            />
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer
        style={{
          backgroundColor: darkMode ? "#2c2c2c" : "#f8f9fa", 
        }}
      >
        <Button variant={darkMode ? "light" : "success"} onClick={handleSaveAndClose}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecommendationPopup;
