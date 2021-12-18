const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1qdkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('capellaDb');
        const mealsCollection = database.collection('meals');
        const orderCollection = database.collection('order');
        const reviewsCollection = database.collection('reviews');
        const userCollection = database.collection('users');

        //GET API
        app.get('/meals', async (req, res) => {
            const cursor = mealsCollection.find({});
            const meals = await cursor.toArray();
            res.send(meals);
        })

        //GET Single Meal
        app.get('/meals/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const meal = await mealsCollection.findOne(query);
            res.json(meal);
        });

        //Delete Meal
        app.delete('/meals/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await mealsCollection.deleteOne(query);
            res.json(result);
        })

        //POST API add meal
        app.post('/meals', async (req, res) => {
            const meal = req.body;
            const result = await mealsCollection.insertOne(product);
            res.json(result);
        });

        //Add order API
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        //use POST to Get data by email
        app.post('/order/byEmail', async (req, res) => {
            const email = req.body.email
            const query = { email: email };
            const cursor = await orderCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })


        //Get all users ordered meals
        app.get('/order', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //update ordered status by admin
        app.put('/order/:id', async (req, res) => {
            const mealId = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(mealId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        //DELETE API order by user
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        //Get all Review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        //Add Review API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        //UPDATE user and set admin role
        app.put('/users/admin/:email', async (req, res) => {
            const makeNewAdmin = req.body;
            const requester = req.params.email;

            if (requester) {
                const requesterAccount = await userCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: makeNewAdmin.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await userCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make Admin' })
            }
        })

        // GET User Check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //Insert User to DB
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Capella Website')
})

app.listen(port, () => {
    console.log(" listening at", port)
})
