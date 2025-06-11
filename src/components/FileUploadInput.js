import React, { useState } from 'react';
import axios from 'axios';
import './FileUploadInput.css';

const FileUploadInput = ({
  endpoint,
  onUploadSuccess,
  onUploadError,
  maxFiles = 1,
  acceptedFileTypes = "*",
  fieldName = "file"
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (event) => {
    setError('');
    setSuccessMessage('');
    const files = Array.from(event.target.files);

    if (files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} file(s).`);
      setSelectedFiles([]);
      return;
    }

    const invalidFile = files.find(
      (file) => acceptedFileTypes !== "*" && !file.type.match(acceptedFileTypes)
    );
    if (invalidFile) {
      setError(`File type not allowed: ${invalidFile.name}`);
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append(fieldName, file);
    });

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        withCredentials: true, // for cookie-based auth if needed
      });

      setSuccessMessage('✅ File uploaded successfully.');
      setSelectedFiles([]);
      setUploadProgress(0);
      onUploadSuccess?.(response.data);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Upload failed.');
      onUploadError?.(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload-wrapper">
      <input
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        multiple={maxFiles > 1}
      />
      {selectedFiles.length > 0 && (
        <div className="file-list">
          {selectedFiles.map((file) => (
            <div key={file.name}>{file.name}</div>
          ))}
        </div>
      )}
      {isUploading && (
        <div className="upload-progress">Uploading: {uploadProgress}%</div>
      )}
      <button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div className="error-text">{error}</div>}
      {successMessage && <div className="success-text">{successMessage}</div>}
    </div>
  );
};

export default FileUploadInput;
