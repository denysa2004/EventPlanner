import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Register.css";
import "../styles/EventPhotos.css";

function EventPhotos() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchEventAndPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventAndPhotos = async () => {
    try {
      setLoading(true);
      setError("");

      if (!currentUser?.userId) {
        setError("User not logged in");
        navigate("/");
        return;
      }

      // Fetch event details
      const eventRes = await fetch(`http://localhost:8080/events/${eventId}`);
      if (!eventRes.ok) {
        throw new Error("Failed to fetch event details");
      }
      const eventData = await eventRes.json();
      setEvent(eventData);

      // Check if user is organizer or accepted guest
      const isOrganizer = eventData.organizers?.some(
        (org) => org.userId === currentUser.userId
      );

      let isGuest = false;
      if (!isOrganizer) {
        const guestsRes = await fetch(
          `http://localhost:8080/events/${eventId}/guests`
        );
        if (guestsRes.ok) {
          const guests = await guestsRes.json();
          const guestEntry = guests.find(
            (g) => g.user?.userId === currentUser.userId
          );
          isGuest = guestEntry?.status === "ACCEPTED";
        }
      }

      setIsParticipant(isOrganizer || isGuest);

      if (!isOrganizer && !isGuest) {
        setError(
          "Only event organizers and accepted guests can view/upload photos"
        );
        setLoading(false);
        return;
      }

      // Fetch photos
      const photosRes = await fetch(
        `http://localhost:8080/events/${eventId}/photos`
      );
      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPhotos(Array.isArray(photosData) ? photosData : []);
      } else {
        // If endpoint doesn't exist yet, just show empty
        setPhotos([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validFiles = [];
    const previews = [];
    let hasError = false;

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("All files must be images");
        hasError = true;
        break;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Each file must be less than 5MB");
        hasError = true;
        break;
      }

      validFiles.push(file);
    }

    if (hasError) {
      return;
    }

    setSelectedFiles(validFiles);
    setError("");

    // Create previews for all files
    const previewPromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((results) => {
      setPreviewUrls(results);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError("Please select at least one photo to upload");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const uploadedPhotos = [];
      let successCount = 0;
      let failCount = 0;

      // Upload each file
      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("userId", currentUser.userId);

          const response = await fetch(
            `http://localhost:8080/events/${eventId}/photos`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            failCount++;
            continue;
          }

          const newPhoto = await response.json();
          uploadedPhotos.push(newPhoto);
          successCount++;
        } catch (err) {
          failCount++;
        }
      }

      // Update photos list with newly uploaded photos
      if (uploadedPhotos.length > 0) {
        setPhotos([...uploadedPhotos, ...photos]);
      }

      // Show result message
      if (failCount === 0) {
        setSuccess(
          `${successCount} photo${
            successCount > 1 ? "s" : ""
          } uploaded successfully!`
        );
      } else if (successCount > 0) {
        setSuccess(
          `${successCount} photo${
            successCount > 1 ? "s" : ""
          } uploaded, ${failCount} failed`
        );
      } else {
        setError("Failed to upload photos");
      }

      // Clear selections
      setSelectedFiles([]);
      setPreviewUrls([]);

      // Clear file input
      const fileInput = document.getElementById("photo-upload");
      if (fileInput) fileInput.value = "";

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId, uploaderId) => {
    // Only allow deletion if user is the uploader
    if (uploaderId !== currentUser.userId) {
      alert("You can only delete photos you uploaded");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/events/${eventId}/photos/${photoId}?userId=${currentUser.userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to delete photo");
      }

      setPhotos(photos.filter((p) => p.photoId !== photoId));
      setSuccess("Photo deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete photo");
    }
  };

  if (loading) {
    return (
      <div className="register-page">
        <div className="register-form photos-form">
          <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !isParticipant) {
    return (
      <div className="register-page">
        <div className="register-form photos-form">
          <h1 className="register-title">Event Photos</h1>
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          <button
            className="btn1"
            onClick={() => navigate(`/event/${eventId}`)}
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-form photos-form">
        <h1 className="register-title">
          {event?.eventName || "Event"} - Photos
        </h1>

        <div className="photos-stats">
          <div className="stat-item">
            <span className="stat-number">{photos.length}</span>
            <span className="stat-label">Photos</span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <h3 className="section-title">Upload Photos</h3>

          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-wrapper">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="file-input"
              />
              <label htmlFor="photo-upload" className="file-input-label">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} photo${
                      selectedFiles.length > 1 ? "s" : ""
                    } selected`
                  : "Choose photos (max 5MB each)"}
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="preview-container">
                <div className="preview-grid">
                  {previewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                  ))}
                </div>
              </div>
            )}

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="button-group-inline">
              <button
                type="submit"
                className="btn-upload"
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${
                      selectedFiles.length > 0 ? selectedFiles.length : ""
                    } Photo${selectedFiles.length !== 1 ? "s" : ""}`}
              </button>

              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                    const fileInput = document.getElementById("photo-upload");
                    if (fileInput) fileInput.value = "";
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Photos Gallery */}
        <div className="photos-gallery-section">
          <h3 className="section-title">All Photos ({photos.length})</h3>

          {photos.length === 0 ? (
            <div className="empty-gallery">
              <p>No photos uploaded yet.</p>
              <p
                style={{ fontSize: "0.9rem", color: "#999", marginTop: "8px" }}
              >
                Be the first to share a photo from this event!
              </p>
            </div>
          ) : (
            <div className="photos-grid">
              {photos.map((photo) => (
                <div key={photo.photoId} className="photo-card">
                  <div
                    className="photo-image-wrapper"
                    onClick={() =>
                      setLightboxImage(
                        `http://localhost:8080/events/${eventId}/photos/${photo.photoId}/image`
                      )
                    }
                  >
                    <img
                      src={`http://localhost:8080/events/${eventId}/photos/${photo.photoId}/image`}
                      alt="Event photo"
                      className="photo-image"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='sans-serif' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="photo-overlay">
                      <span className="photo-overlay-text">
                        🔍 Click to view
                      </span>
                    </div>
                  </div>

                  <div className="photo-info">
                    <div className="photo-uploader">
                      Uploaded by:{" "}
                      <strong>{photo.uploaderName || "Unknown"}</strong>
                    </div>
                    <div className="photo-date">
                      {photo.uploadedAt
                        ? new Date(photo.uploadedAt).toLocaleDateString()
                        : ""}
                    </div>
                  </div>

                  {photo.uploaderId === currentUser.userId && (
                    <button
                      className="btn-delete-photo"
                      onClick={() =>
                        handleDelete(photo.photoId, photo.uploaderId)
                      }
                      title="Delete photo"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="button-group">
          <button
            className="btn1"
            onClick={() => navigate(`/event/${eventId}`)}
          >
            Back to Event
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Full size"
              className="lightbox-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventPhotos;
