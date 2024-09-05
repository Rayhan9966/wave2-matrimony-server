const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

//middleware 'http://localhost:5173',
// const corsOptions = {
//   origin: 'https://matrimony-bd-server.vercel.app',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: ['authorization', 'Content-Type'],
// };
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptxksnq.mongodb.net/?appName=Cluster0`;

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
    // await client.connect();


    const userCollection = client.db("MatrimonyDB").collection("users");
    // const biodataCollection = client.db("MatrimonyDB").collection("biodata");
    const biodataCollection = client.db("MatrimonyDB").collection("biodata1");
    const reviewCollection = client.db("MatrimonyDB").collection("reviews");
    const viewCollection = client.db("MatrimonyDB").collection("views");
    const paymentCollection = client.db("MatrimonyDB").collection("payments");


    // jwt rltd api 
    app.post('/jwt', async (req, res) => {
      // console.log(req.headers);
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res.send({ token });
    })
    //middleware token verify
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
      })
    }

    //admin verify after verifytoken

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }


    //user rltd api
    // app.post('/users',async(req,res)=>{
    //   const user=req.body;
    //   const result=await userCollection.insertOne(user);
    //   res.send(result);
    // })


    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      // console.log(req.headers);
      const result = await userCollection.find().toArray();
      res.send(result);
    });


    //admin api
    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });

    })


    app.post('/users', async (req, res) => {
      const user = req.body;
      //insert email if does not exist
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    // app.get('/biodata', async (req, res) => {
    //   const result = await biodataCollection.find().toArray();
    //   res.send(result);
    // })
    app.get('/biodata1', async (req, res) => {
      const result = await biodataCollection.find().toArray();
      // console.log(result);
      res.send(result);
      
    })


    //bio data to server
    // app.post('/biodata', verifyToken, verifyAdmin, async (req, res) => {
    //   const bio = req.body;
    //   const result = await biodataCollection.insertOne(bio);
    //   res.send(result);
    // })
    app.post('/biodata1', verifyToken, verifyAdmin, async (req, res) => {
      const bio = req.body;
      const result = await biodataCollection.insertOne(bio);
      res.send(result);
      console.log(bio);
    })

    //biodata patch update

    // app.patch('/biodata/:id', async (req, res) => {
    //   const bdata = req.body;
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) }
    //   const updatedDoc = {
    //     $set: {
    //       name: bdata.name,
    //       mother_name: bdata.mother_name,
    //       // height:data.height,
    //       height: parseFloat(bdata.height),
    //       weight: parseFloat(bdata.weight),
    //       // weight:data.weight,
    //       email: bdata.email,
    //       // profile_image: bdata.profile_image,
    //       occupation: bdata.occupation,
    //       permanent_division: bdata.permanent_division,
    //       biodata_type: bdata.biodata_type,
    //       age: bdata.age,
    //       dob: bdata.dob,
    //       mobile: bdata.mobile,
    //       image: bdata.image
    //     }
    //   }
    //   const result = await biodataCollection.updateOne(filter, updatedDoc)
    //   res.send(result);
    // })
    app.patch('/biodata1/:id', async (req, res) => {
      const bdata = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          name: bdata.name,
          mother_name: bdata.mother_name,
          // height:data.height,
          height: parseFloat(bdata.height),
          weight: parseFloat(bdata.weight),
          // weight:data.weight,
          email: bdata.email,
          // profile_image: bdata.profile_image,
          occupation: bdata.occupation,
          permanent_division: bdata.permanent_division,
          biodata_type: bdata.biodata_type,
          price: parseFloat(bdata.price),
          age: bdata.age,
          dob: bdata.dob,
          mobile: bdata.mobile,
          image: bdata.image
        }
      }
      const result = await biodataCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    //biodata delete

    // app.delete('/biodata/:id', verifyToken, verifyAdmin, async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await biodataCollection.deleteOne(query);
    //   res.send(result);
    // })
    app.delete('/biodata1/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await biodataCollection.deleteOne(query);
      res.send(result);
    })
    //biodata get update
    // app.get('/biodata/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await biodataCollection.findOne(query);
    //   res.send(result);
    // })
    app.get('/biodata1/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await biodataCollection.findOne(query);
      res.send(result);
    })

    //review
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    // const biodataCollection = client.db("MatrimonyDB").collection("biodata");


    //view collection
    app.get('/views', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await viewCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/views', async (req, res) => {
      const viewItem = req.body;
      const result = await viewCollection.insertOne(viewItem)
      res.send(result);

    })

    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })


    //user dlt
    app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    //delete
    app.delete('/views/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await viewCollection.deleteOne(query);
      res.send(result);
    })

    //Payment intent 
    app.post('/create-payment-intent', async (req, res) => {

      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'amount is intent');

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'aed',
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });

//payment history
app.get('/payments/:email', verifyToken, async(req,res)=>{
  const query ={email: req.params.email}
  if(req.params.email !== req.decoded.email){
    return res.status(403).send({message: 'forbidden access'});
  }
  const result= await paymentCollection.find(query).toArray();
  res.send(result);

})


//payment related api
app.post('/payments', async (req,res)=>{
  const payment=req.body;
  const paymentResult=await paymentCollection.insertOne(payment);

//dlt itm from view carefully
console.log('payment info',payment);
const query={_id:{
  $in: payment.viewIds.map(id => new ObjectId(id))
}};
const deleteResult= await viewCollection.deleteMany(query);

res.send({paymentResult, deleteResult});

})

//state or analyticssss
app.get('/admin-stats', async(req,res)=>{
  const users=await userCollection.estimatedDocumentCount();
  const biodata=await biodataCollection.estimatedDocumentCount();
  // const payment=await paymentCollection.estimatedDocumentCount();
  const view=await viewCollection.estimatedDocumentCount();

  // this is nit the best way


// const payments = await paymentcollection.find().toArray();
// const revenue=payments.reduce((total, payment) => total + payment.price, 0);
const result=await paymentCollection.aggregate([
  {
    $group:{
      _id:null,
      totalRevenue:{
        $sum: '$price'
      }
    }
  }
]).toArray();
const revenue=result.length>0 ? result[0].totalRevenue :0;

  res.send({
    users,biodata ,view,revenue
  })

})




// 

 // using aggregate pipeline
//  app.get('/view-stats',  async(req, res) =>{
//   const result = await paymentCollection.aggregate([
//     {
//       $unwind: '$viewIds'
//     },
    
//      { $lookup: {
//         from: 'views',
//         localField: 'viewIds',
//         foreignField: '_id',
//         as: 'viewCollect'
//       }},
    
//     // },
//     // {
//     //   $unwind: '$menuItems'
//     // },
//     // {
//     //   $group: {
//     //     _id: '$menuItems.category',
//     //     quantity:{ $sum: 1 },
//     //     revenue: { $sum: '$menuItems.price'} 
//     //   }
//     // },
//     // {
//     //   $project: {
//     //     _id: 0,
//     //     category: '$_id',
//     //     quantity: '$quantity',
//     //     revenue: '$revenue'
//     //   }
//     // }
//   ]).toArray();

//   res.send(result);

// })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Matrimony is running')
})

app.listen(port, () => {
  console.log(`Bd MAtrimony is running on port ${port} `);
})



/**
 * 
 * ----------
 * step
 * --------------
 * app.get('/users')
 * app.get('/users/:id')
app.post('/users') user create
app.put('/users/:id') specifice
app.patch('/users/:id')
app.delete('/users/:id')


 */