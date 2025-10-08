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
    //for menu data cellection end
      //for revwes data cellection start
    const reviewCollection = client.db("digital-restruant").collection("reviews");
    //for revwes data cellection end

   //make middle weres for varify token start
    const verifyToken = (req, res, next) => {
      // console.log('inside verify token',req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({messege: 'authorizaed access'});
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

    //use verify admin after verify token start 
   const verifyAdmin = async(req, res, next)=>{
    const email = req.decoded.email;
    const query = {email:email};
    const user = await userCollection.findOne(query);
    const isAdmin = user?.role === 'admin';
    console.log('Admin check:', email, isAdmin);
    if(!isAdmin){
      return res.status(403).send({message: 'forbidden access'});
      // console.log("decoded email:", req.decoded.email);
    }
    next();
   }
   //use verify admin after verify token end
    //for menu data get start
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });
    //for menu data get end
    
    //for addmenu post api server start
    app.post('/menu', verifyToken,verifyAdmin,async (req,res)=>{
      const item = req.body;
      const result = await menuCollection.insertOne(item)
      res.send(result);
    })
     //for addmenu post api server start

     //make menu update api  to get soecpic id start
    app.get('/menu/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await menuCollection.findOne(query);
      res.send(result);
    })
    //make menu update api  to get soecpic id end

    //for update menu patch api start
   app.patch('/menu/:id',async(req, res) =>{
    const id = req.params.id; 
    const item = req.body;
    const filter = { _id: id };
    const updateDoc = {
      $set:{
        name:item.name,
        category:item.category,
        price:item.price,
        recipe:item.recipe,
        image: item.image
      }
    }
    const result = await menuCollection.updateOne(filter, updateDoc)
    res.send(result);
   })
    //for update menu patch api end

      //make menu delite api start
    app.delete('/menu/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await menuCollection.deleteOne(query);
      res.send(result);
    })
    //make menu delite api end

     //for revwes data get start
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
   //for revwes  data get end
   
    //for cart data cellection start
    const cartCollection = client.db("digital-restruant").collection("cart");
     //for cart data cellection and api end

      //for make user data cellection and store api start
    const userCollection = client.db("digital-restruant").collection("users");
    //for make user data cellection and store api start
    
    //for jwt token make api start 2
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })
    //for jwt token  make api END 2

    //carta data  get loade st
    app.get('/carts', async (req, res) => {
      //for recive Email start
      const email = req.query.email;
      const query = { email: email };
      //for recive Email end
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    //carta data  get loade end

    //carts cellection post start
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })
    //carts cellection post end
   
    //fro make cart delete api start
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })
    //fro make delete api end>

    //for user admin make start>
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async (req, res) => {
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

    //for get user apistart
    app.get('/users',verifyToken,verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    //for get user api end

    //for get user admin api start>
   app.get('/users/admin/:email',verifyToken, async (req, res) =>{
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
   res.send({ admin });
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
    app.delete('/users/:id',verifyToken,verifyAdmin, async (req, res) => {
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