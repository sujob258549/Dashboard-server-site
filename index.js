const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000


app.use(express.json())
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://online-shop12-7b3e8.web.app'
    ],
    credentials: true
}))



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const productsCalection = client.db('our-online-shop').collection('products')


        app.post('/user', async (req, res) => {
            const data = req.body;
            const query = { email: data.email }
            const existiong = await userCalection.findOne(query);
            if (existiong) {
                return res.send({ message: 'user alrady existion', insertedId: null })
            }
            const result = await userCalection.insertOne(data);
            res.send(result);
        })
        app.get('/soicifaiUser/:email', async (req, res) => {
            const email = req.params.email;
            let query = {}
            if (query) {
                query = { email: email }
            }
            const result = await userCalection.findOne(query)
            res.send(result)
        })
        // add delivary
        app.patch('/adddalivari/:email', async (req, res) => {
            const email = req.params.email;
            if (!email || !req.body.dalivary) {
                return res.status(400).json({ message: "Email and dalivary are required fields" });
            }
        
            const filter = { email: email };  // Define the filter to find the correct document
            const updateDoc = {
                $set: {
                    delevary: req.body.dalivary,
                }
            };
        
            try {
                const result = await userCalection.updateOne(filter, updateDoc);
                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
        // update user
        app.patch('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const data = req.body;
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    name: data.name,
                    photo: data.photo
                }
            };
            try {
                const result = await userCalection.updateOne(filter, updateDoc, option);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        // admin here hasbord

        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;

            if (!email) {
                return res.status(400).send({ error: 'Email parameter is required' });
            }

            try {
                const query = { email: email };
                const user = await userCalection.findOne(query);

                const admin = user?.userType === 'admin';

                res.send({ admin });
            } catch (error) {
                console.error('Error fetching user:', error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });


        // roll user

        app.get('/user/main/:email', async (req, res) => {
            const email = req.params.email;

            if (!email) {
                return res.status(400).send({ error: 'Email parameter is required' });
            }

            try {
                const query = { email: email };
                const users = await userCalection.findOne(query);

                const user = users?.userType === 'user';

                res.send({ user });
            } catch (error) {
                console.error('Error fetching user:', error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // delivari man 
        app.get('/user/deliveryman/:email', async (req, res) => {
            const email = req.params.email;

            if (!email) {
                return res.status(400).send({ error: 'Email parameter is required' });
            }

            try {
                const query = { email: email };
                const users = await userCalection.findOne(query);

                const deliveryman = users?.userType === 'DeliveryMen';

                res.send({ deliveryman });
            } catch (error) {
                console.error('Error fetching user:', error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });


        // all user get 
        app.get('/allusers', async (req, res) => {
            let query = {};
            query = { userType: "user" }
            const data = await userCalection.find(query).toArray()
            res.send(data)
        })
        // all delevari man
        app.get('/alldalivariman', async (req, res) => {
            let query = {};
            query = { userType: "DeliveryMen" }
            const data = await userCalection.find(query).toArray()
            res.send(data)
        })
        // all dalivariman
        // app.get('/alldalivarimans', async (req, res) => {
        //     let query = {};
        //     query = { userType: "DeliveryMen" }
        //     const data = await userCalection.find(query).toArray()
        //     res.send(data)
        // })


        app.post('/priductinfo', async (req, res) => {
            const data = req.body;
            const result = await productsCalection.insertOne(data);
            res.send(result)
        })
        app.get('/productinfo', async (req, res) => {
            const result = await productsCalection.find().toArray();
            res.send(result)
        })

        app.get('/spicifyproductinfo/:email', async (req, res) => {
            const email = req?.params?.email;
            let query = {}
            if (email) {
                query = { delivarimanid: email }
            }
            const result = await productsCalection.find(query).toArray();
            res.send(result)



        })
        // my product
        app.get('/myproduct/:email', async (req, res) => {
            const email = req?.params?.email;
            let query = {}
            if (email) {
                query = { "productInfo.email": email }
            }
            const result = await productsCalection.find(query).toArray();
            res.send(result)



        })

        app.get('/priductinfo/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await productsCalection.findOne(filter);
            res.send(result)
        })

        app.put('/productinfo/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body.productInfo;
            const data2 = req.body.status;
            // console.log({data});
            // return
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    "productInfo.name": data.name,
                    "productInfo.email": data.email,
                    "productInfo.phone": data.phone,
                    "productInfo.parcelType": data.parcelType,
                    "productInfo.receiverName": data.receiverName,
                    "productInfo.receiverPhone": data.receiverPhone,
                    "productInfo.deliveryAddress": data.deliveryAddress,
                    "productInfo.requestedDeliveryDate": data.requestedDeliveryDate,
                    "productInfo.deliveryAddressLatitude": data.deliveryAddressLatitude,
                    "productInfo.deliveryAddressLongitude": data.deliveryAddressLongitude,
                    "productInfo.deliveryPrice": data.deliveryPrice,
                    "status.status": data2.status,
                    "status.date": data2.date
                }
            }
            const result = await productsCalection.updateOne(filter, updateDoc, option);
            res.send(result)
        })


        app.patch('/updateproductinfo/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body.status;
            const data2 = req.body.productUpdatedate;
            console.log(data, data2);
            const updateDoc = {
                $set: {
                    'status.status': data.status,
                    delivarimanid: data2.delivarimanid,
                    approximateDeliveryDate: data2.approximateDeliveryDate

                }
            }
            const result = await productsCalection.updateOne(filter, updateDoc);
            res.send(result)
        })
        // cancel status 
        app.patch('/canceldalivary/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body;
            const updateDoc = {
                $set: {
                    'status.status': data.status,
                    delivarimanid: ''
                }
            }
            const result = await productsCalection.updateOne(filter, updateDoc);
            res.send(result)
        })
        // status dalivared
        app.patch('/fainaldalivary/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body;
            const updateDoc = {
                $set: {
                    'status.status': data.status,
                }
            }
            const result = await productsCalection.updateOne(filter, updateDoc);
            res.send(result)
        })

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