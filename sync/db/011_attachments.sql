CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  filename VARCHAR(255),
  origName VARCHAR(255),
  origFilename VARCHAR(255),
  filepath VARCHAR(255),
  mime_type VARCHAR(255),
  size INT,
  content_id VARCHAR(255),
  disposition VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (message_id)
);