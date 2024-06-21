const express=require('express');
const path = require('path');
const bcrypt=require('bcrypt');
const usermodel=require("./models/usermodel")
const jwt=require("jsonwebtoken")
const cors=require("cors")
const app=express();
const multer=require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Image=require('./models/Imagemodel')



app.use(bodyParser.json());
var cookieParser = require('cookie-parser');
const { log } = require('console');
app.set('view engine','ejs')
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser())
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));

 
app.use(express.static(path.resolve(__dirname, 'frontend', 'build')));

app.get("/", (req, res) => {
  app.use(express.static(path.resolve(__dirname, "frontend", "build")));
  res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
});



app.post('/signup',(req,res)=>{
   
    let {username,email,password}=req.body;
    bcrypt.genSalt(10, function(err, salt) {
   bcrypt.hash(password, salt, async(err, hash)=> {
        let createduser=await usermodel.create({
          username,
          email,
          password:hash,
          })
          let token=jwt.sign({email},"shhhhhhh");
          res.cookie("token",token);
          console.log(createduser);
          res.status(201).send({ message: "User created successfully" });
      });
  });
})



app.post('/login', async (req, res) => {
  try {
    let user = await usermodel.findOne({ username: req.body.username });
    if (!user) return res.status(404).send("User doesn't exist");
    
    console.log('Request Password:', req.body.password);
    console.log('Stored Hashed Password:', user.password);
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (err) {
        return res.status(500).send("Error comparing passwords");
      }
      if (result) {
        let token = jwt.sign({ username: user.username }, "shhhhhhh");
        res.cookie("token", token);
        res.send("You can login");
      } else {
        res.status(401).send("Incorrect password, you can't login");
      }
    });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


app.post('/upload', upload.single('image'), async (req, res) => {
  try {
      const newImage = new Image({
          filename: req.file.filename,
          path: req.file.path
      });
      await newImage.save();
      res.json({ message: 'Image uploaded and metadata saved successfully!' });
      console.log(newImage);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

app.get('/images',async(req,res)=>{
 try{
  const images=await Image.find({})
  res.json(images);
  // res.send("images uploaded");
  console.log(images);
 }
 catch(err){
  console.log(err);
 }
})

app.post('/like',async(req,res)=>{
try{
  const { imageId } = req.body;
   const image=await Image.findById(imageId);
   if(!image) alert("image dosent exist");
   image.likes+=1;
   await image.save();
        res.json({ message: 'Like updated successfully', updatedImage: image });
}
catch(err){
  console.log(err);
}
})


app.post('/comment', async (req, res) => {
  try {
      const { imageId, text } = req.body;
      const image = await Image.findById(imageId);
      if (!image) {
          return res.status(404).json({ error: 'Image not found' });
      }
      image.comments.push(text);
      await image.save();
      console.log("commented successfully");
  } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/delete/:id',async(req,res)=>{
  try{
    const {id}=req.params;
    await Image.findByIdAndDelete(id); 
    console.log("post deleted successfully");
  }
  catch(err){
    console.log("error in deleting post");
  }
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Route to handle forgot password request
app.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token for password reset link
    const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });

    // Send password reset email
    const mailOptions = {
      from: 'ramg8305@gmail.com',
      to: email,
      subject: '9403985268',
      html: `
        <p>Please click <a href="http://localhost:3000/resetpassword/${token}">here</a> to reset your password.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending reset email' });
      }
      console.log('Email sent:', info.response);
      return res.status(200).json({ message: 'Reset email sent' });
    });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(3000);