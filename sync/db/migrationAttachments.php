<?php
// migration_attachments.php

//require_once 'vendor/autoload.php';

// Database connection
$db = new PDO('mysql:host=192.168.0.24;dbname=libremail', 'admin', 'wakawaka');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get all messages with attachments
$stmt = $db->query("SELECT id, attachments FROM messages WHERE attachments IS NOT NULL AND attachments != ''");

$count = 0;
$total = $stmt->rowCount();
echo "Found $total messages with attachments to migrate\n";

while ($message = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $attachments = json_decode($message['attachments'], true);
    
    if (!is_array($attachments)) {
        continue;
    }
    
    foreach ($attachments as $attachment) {
        try {
            $insertStmt = $db->prepare("
                INSERT INTO attachments 
                (message_id, filename, origName, origFilename, filepath, mime_type, size, content_id, disposition, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            // For existing data, set origName and origFilename to filename if they don't exist
            $filename = $attachment['filename'] ?? '';
            $origName = $attachment['origName'] ?? $attachment['name'] ?? $filename;
            $origFilename = $attachment['origFilename'] ?? $filename;
            
            // Generate a filepath similar to the format in the example
            // Format: YYYY/MM/DD_[random-id]_filename
            $filepath = '';
            if (!empty($filename)) {
                $date = date('Y/m/d');
                $randomId = md5(uniqid($message['id'] . '_' . $filename, true));
                $filepath = $date . '_' . $randomId . '_' . $filename;
            }
            
            $insertStmt->execute([
                $message['id'],
                $filename,
                $origName,
                $origFilename,
                $filepath,
                $attachment['mime_type'] ?? $attachment['mimeType'] ?? '',
                $attachment['size'] ?? 0,
                $attachment['content_id'] ?? '',
                $attachment['disposition'] ?? ''
            ]);
            
            $count++;
            if ($count % 1000 === 0) {
                echo "Migrated $count attachments...\n";
            }
        } catch (Exception $e) {
            echo "Error migrating attachment for message {$message['id']}: {$e->getMessage()}\n";
        }
    }
}

echo "Migration complete. Migrated $count attachments from $total messages.\n";