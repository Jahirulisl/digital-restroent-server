const express = require('express');
const app = express();
const cors = require('cors')

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
    //for cart data cellection end

    //fro make delete api start>
   app.delete('/carts/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await cartCollection.deleteOne(query);
    res.send(result);
   })
    //fro make delete api end>

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