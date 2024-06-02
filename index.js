const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000


app.use(express.json())
app.use(cors())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://online_shop_12:gZKcPQZgsLluP0Ut@atlascluster.aasa6jh.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster";

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
        const userCalection = client.db('our-online-shop').collection('user')


        app.post('/user', async(req, res)=>{
            const data = req.body;
            const query = {email: data.email}
            const existiong = await userCalection.findOne(query);
            if(existiong){
                return res.send({message: 'user alrady existion', insertedId: null})
            }
            const result = await userCalection.insertOne(data);
            res.send(result);
        })
        // Connect the client to the server	(optional starting in v4.7)

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('online shop')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})