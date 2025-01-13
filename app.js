const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data'); 
const app = express();

// Face++ API 
const port = process.env.PORT || 3000;
const apiKey = 'apihere';
const apiSecret = 'W0nA-iGl6wE1EA13cphiKLMw9Q9u9BwB';

// Multer 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Set view engine 
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.render('index');
});

// Analyze
app.post('/analyze', upload.single('image'), async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.file.filename);

  // Create a FormData instance 
  const formData = new FormData();
  formData.append('api_key', apiKey);
  formData.append('api_secret', apiSecret);
  formData.append('image_file', fs.createReadStream(filePath));
  formData.append('attributes', 'gender,age,smile,headpose,blur,eyestatus,emotion,beauty,mouthstatus,eyegaze,skinstatus');

  console.log('Form Data:', formData);

  try {
    const response = await axios.post(
      'https://api-us.faceplusplus.com/facepp/v3/detect',
      formData,
      {
        headers: {
          ...formData.getHeaders() 
        },
      }
    );

    // Log the full API response to inspect the data
    console.log('Full API response:', response.data);

    const faceData = response.data.faces;
    if (faceData.length > 0) {
      console.log('Faces detected:', faceData);  
      res.render('result', {
        imageUrl: `/uploads/${req.file.filename}`,
        faceData: faceData[0],
        message: "Face analysis complete!"
      });
    } else {
      console.log('No faces detected');
      res.send("No faces detected.");
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).send('Error analyzing the image');
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
