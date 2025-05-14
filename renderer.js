// Import required modules
const QRCode = require('qrcode');

// Initialize the application
async function initialize() {
  
  console.log('Initializing application...');
  console.log('QRCode module loaded:', typeof QRCode);
  console.log('Canvas support:', !!document.createElement('canvas').getContext);
  
  // Set up event listeners
  document.getElementById('sendButton').addEventListener('click', uploadFile);
  
  // Test Electron API connectivity
  await testElectronAPI();
  
  // Display initial status
  document.getElementById('status').textContent = 'Ready to send files';
}

// Test Electron API functionality
async function testElectronAPI() {
  try {
    if (window.electronAPI) {
      const ip = await window.electronAPI.getIP();
      console.log('IP Detection working. Detected IP:', ip);
      document.getElementById('ipDisplay').textContent = `Your local IP: ${ip}`;
    } else {
      console.warn('Electron API not available - running in browser mode');
      document.getElementById('ipDisplay').textContent = 'Running in limited browser mode';
    }
  } catch (e) {
    console.error('Electron API test failed:', e);
    document.getElementById('ipDisplay').textContent = 'IP detection unavailable';
  }
}

// Main file upload function
async function uploadFile() {
  try {
    console.log('Starting file upload process...');
    
    // Clear previous state
    console.clear();
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('fileUrl').textContent = '';
    
    // Get selected file
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    // Validate file selection
    if (!file) {
      throw new Error('Please select a file first!');
    }
    console.log('Selected file:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);

    // Update UI for upload state
    document.getElementById('sendButton').disabled = true;
    document.getElementById('status').textContent = `Uploading ${file.name}...`;
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Send file to server
    console.log('Sending file to server...');
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    });

    // Handle server response
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Server responded with error');
    }

    const data = await response.json();
    console.log('Server response:', data);

    // Generate download URL
    const ip = await window.electronAPI?.getIP?.() || 'localhost';
    const fileUrl = `http://${ip}:3000/${data.fileName}`;
    console.log('File available at:', fileUrl);

    // Clear previous QR code
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';

    // Create canvas element explicitly
    const canvas = document.createElement('canvas');
    qrcodeDiv.appendChild(canvas);

    // Generate QR code with error handling
    try {
      await QRCode.toCanvas(canvas, fileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      console.log('QR code generated successfully');
      document.getElementById('status').textContent = 'Scan QR code to download';
    } catch (qrError) {
      console.error('QR generation failed:', qrError);
      qrcodeDiv.innerHTML = '<p>QR generation failed. Use this URL instead:</p>';
      throw new Error('Failed to generate QR code. Please use the URL below.');
    }
    
    // Update UI with results
    document.getElementById('status').textContent = 'File ready for transfer!';
    document.getElementById('fileUrl').textContent = fileUrl;
    document.getElementById('fileUrl').href = fileUrl;

  } catch (error) {
    console.error('Upload process failed:', error);
    document.getElementById('status').textContent = error.message;
    document.getElementById('status').style.color = 'red';
    handleUploadError(error);
  } finally {
    document.getElementById('sendButton').disabled = false;
  }
}

// Generate QR code for the given URL
async function generateQRCode(url) {
  try {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ''; // Clear previous QR code
    
    await QRCode.toCanvas(qrContainer, url, { 
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    console.log('QR code generated successfully');
  } catch (error) {
    console.error('QR generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Handle upload errors
function handleUploadError(error) {
  const errorMessage = error.message || 'File transfer failed';
  document.getElementById('status').textContent = errorMessage;
  document.getElementById('status').style.color = 'red';
  
  // Show error for 5 seconds, then reset
  setTimeout(() => {
    document.getElementById('status').textContent = 'Ready to try again';
    document.getElementById('status').style.color = '';
  }, 5000);
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);