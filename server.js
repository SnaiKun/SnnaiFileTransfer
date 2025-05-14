const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(fileUpload());
app.use(express.static("public"));
//Update the CORS headers to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  const file = req.files.file;
  const uploadPath = path.join(__dirname, 'public', file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('File uploaded to:', uploadPath);
    res.json({ 
      success: true,
      fileName: file.name,
      message: 'File uploaded successfully'
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});