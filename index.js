const firebase = require("firebase")
const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyD4MjAY3PHlyM-PFamEgzTPdZfSSHNVLA8",
    authDomain: "recipes-backend-46c08.firebaseapp.com",
    projectId: "recipes-backend-46c08",
    storageBucket: "recipes-backend-46c08.appspot.com",
    messagingSenderId: "582888779214",
    appId: "1:582888779214:web:8e4e6aaae4d61c3e05cf9f"
})

const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 4999

const bodyParser = require('body-parser')
const { firestore } = require("./firebase.utils")

app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.get('/api/getAllRecipes', async (req,res) => {

    let data = []
    let response = await firebaseApp.firestore().collection('allRecipes').get()
    response.forEach(item => {
        data.push(item.data())
    })
    

    res.json(data);
})

app.post('/api/createRecipe', async (req, res) => {
    let data = req.body

    await firebaseApp.firestore().collection('allRecipes').doc(data.name).set(
        { recipeName, ingredients, steps, chefName } = data
    )

    res.json("Successfully added the recipe")
})

app.listen(port, () => {
    console.log("Connection established, app listening to ",port)
})