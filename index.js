const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');

const app = express();
const cors = require('cors')

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bnebi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

async function run(){
    try{
        await client.connect();
        
        const db = client.db("p-job");
        const user_collection = db.collection("user");

        /**
         * add user to database
         */
        app.post('/user', async(req, res) => {
			const data = req.body;
            const nidPic = req.files.nidPic.data;
            const encodedNidPic = nidPic.toString('base64');
            const nid = Buffer.from(encodedNidPic, 'base64');

            const profilePic = req.files.profilePic.data;
            const encodedprofilePic = profilePic.toString('base64');
            const profile = Buffer.from(encodedprofilePic, 'base64');

            let licence = '';
            if (data.role == 'Rider') {
                const licencePic = req.files.licencePic.data;
                const encodedlicencePic = licencePic.toString('base64');
                licence = Buffer.from(encodedlicencePic, 'base64');
            }

            const user = {
                ...data,
                nidPic: nid,
                profilePic: profile,
                licencePic: licence
            }
            console.log(user);

			const result = await user_collection.insertOne(user);
			res.json(result);
        });

        /**
		 * Get user by email
		 */
        app.get('/user/:email', async(req, res) => {
			const query = {email: req.params.email}
            const result = await user_collection.find(query).toArray();
            res.json(result);
        });

		/**
		 * Get all user
		 */
		 app.get('/user', async(req, res) => {
            const result = await user_collection.find().toArray();
            res.json(result);
        });



    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Rider Running!');
})

app.listen(port, () => {
  console.log(`listening port: ${port}`);
})