require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload= require('express-fileupload')
const cors= require('cors');
const fs= require('fs-extra')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app =express();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hd52t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri,{ useUnifiedTopology: true }, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('asset'));
app.use(fileUpload());

client.connect(err => {
  const customarCollection = client.db("CrativeAgency").collection("customarOrder")
  const servicesCollection = client.db("CrativeAgency").collection("services")
  const reviewCollection   = client.db("CrativeAgency").collection("review")
  const adminCollection   = client.db("CrativeAgency").collection("admin")

  app.post('/addAdmin', (req, res)=>{
      const email = req.body.email;
      adminCollection.insertOne({email})
      .then(result => {
          res.send(result.insertedCount > 0)
      })
  })

  app.post('/addServices', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    servicesCollection.insertOne({ title, description, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/services', (req, res)=>{
  servicesCollection.find({})
   .toArray((err, documents)=>{
        res.send(documents)
   })
  })



  app.post('/placeOrder', (req, res) => {
    const file = req.files.file;
    const image = req.body.image;
    const status = req.body.status;
    const name = req.body.name;
    const email = req.body.email;
    const price = req.body.price;
    const service = req.body.service;
    const description = req.body.description;
   
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var img = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
   
    customarCollection.insertOne({ name, email, price, service, description, file, image, img, status })
      .then(result => {
        console.log(result);
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/getOrder', (req, res)=>{
    customarCollection.find({})
    .toArray((err, documents)=>{
        res.send(documents)
    })
  })


  app.get('/order', (req, res) => {
   
    customarCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/review', (req, res) => {
   const name = req.body.name;
    const companyName = req.body.companyName;
    const description = req.body.description;
 reviewCollection.insertOne({ name,companyName,  description,   })
      .then(result => {
        console.log(result);
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/getReview', (req, res) => {
   
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  
});






app.get('/', (req,res)=>{
    res.send('Hello World')
})

app.listen(process.env.PORT || 5000, ()=>{
    console.log('the server start on port 5000');
})