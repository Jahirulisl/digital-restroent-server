const express = require('express');
const app = express();
const cors = require('cors')
//make jswon token start paret 1
const jwt = require('jsonwebtoken');
//make jswon token end paret 1

//from .env start 
require('dotenv').config()


const port = process.env.PORT || 5000;

//middlewares start >
app.use(cors());
app.use(express.json());

//FOR CENNECT BY MONGODB START

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5ort.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //for menu data cellection start
    const menuCollection = client.db("digital-restruant").collection("menu");

    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });
    //for menu data cellection end

    //for revwes data cellection start
    const reviewCollection = client.db("digital-restruant").collection("reviews");

    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    //for revwes data cellection end

    //for cart data cellection start
    const cartCollection = client.db("digital-restruant").collection("cart");
    //carta data loade st
    app.get('/carts', async (req, res) => {
      //for recive Email start
      const email = req.query.email;
      const query = { email: email };
      //for recive Email end
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    //carts cellection post
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })
    //for cart data cellection and api end

    //fro make cart delete api start>
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })
    //fro make delete api end>
    //for user admin make start>
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result);
    })
    //for user admin make end>

    //for jwt token api start 2
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })
    //for jwt token api END 2

    //for make user data cellection and store api start
    const userCollection = client.db("digital-restruant").collection("users");
    //for api
    //make middle weres for varify token start
    const verifyToken = (req, res, next) => {
      console.log('inside verify token',req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({messege: 'forbidden access'});
      }
      const token = req.headers.authorization.split(' ')[1] ;
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err){
          return res.status(401).send({message: 'forbiden access'})
        }
       req.decoded = decoded;
       next();
      })
      
    }
    //make middle weres for varify token end

    //for get user apistart
    app.get('/users',verifyToken, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    //for get user api end

    //for get user admin api start>
   app.get('/user/admin/:email',verifyToken, async (req, res) =>{
   const email = req.params.email;
   if(email !== req.decoded.email){
    return res.status(403).send({message: 'unauthorized access'})
   }
   const query = {email:email};
   const user = await userCollection.findOne(query);
   let admin = false;
   if(user){
    admin = user?.role === 'admin';
   }
   res.send({admin});
   })
    //for get user admin api end>
    
    app.post('/users', async (req, res) => {
      const user = req.body;
      //you can do this many ways (1.email uniqe,2.upsert, 3.simple checking) str
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ messege: 'user already exists', insertedId: null })
      }
      //you can do this many ways (1.email uniqe,2.upsert, 3.simple checking)end
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    //make user delete api start
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })
    //make user delete api end

    //for make user data cellection store api end

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//FOR CENNECT BY MONGODB END

app.get('/', (req, res) => {
  res.send('boss is sitting')
});

app.listen(port, () => {
  console.log(`Bstro boss is sitting on port ${port}`);
})


/**
 *--------------------------------
   MANAGEING CONVENTION
*----------------------------------
*app.get("/users")
*app.get("/users/:id")
*app.post('/users')

 * 
*/