import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaDownload, FaTrash, FaArrowLeft } from "react-icons/fa";
import "../styles/UploadedDocuments.css"; // Create this CSS file

const UploadedDocuments = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await fetch("http://localhost:5000/api/users/uploaded-files", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch uploaded files.");
        }

        const data = await response.json();
        setUploadedFiles(data.files || []);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
        setMessage("⚠ Error loading documents.");
      }
      setLoading(false);
    };

    fetchUploadedFiles();
  }, []);

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`http://localhost:5000/api/users/delete-file/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete file.");
      }

      setUploadedFiles(uploadedFiles.filter(file => file._id !== fileId));
      setMessage("✅ File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("⚠ Failed to delete file.");
    }
  };

  return (
    <div className="uploaded-documents-container">
      <button className="back-button" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft /> Back to Dashboard
      </button>

      <h2><FaFileAlt /> Uploaded Documents</h2>

      {loading ? (
        <p>Loading...</p>
      ) : uploadedFiles.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul className="uploaded-documents-list">
          {uploadedFiles.map((file, idx) => (
            <li key={idx} className="document-item">
              <FaFileAlt className="file-icon" />
              <div className="file-info">
                <strong>{file.fileName}</strong> <br />
                <span>Type: {file.documentType}</span> | 
                <span> Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</span>
              </div>
              <div className="file-actions">
                <a href={file.filePath} download className="download-button">
                  <FaDownload /> Download
                </a>
                <button className="delete-button" onClick={() => handleDeleteFile(file._id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UploadedDocuments;
