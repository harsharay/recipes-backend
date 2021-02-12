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
// const { firestore } = require("./firebase.utils")

const jwt = require('jsonwebtoken')

app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//VERIFY JWT TOKEN
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization']

    if(bearerHeader) {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1]

        req.token = bearerToken;

        next();
    } else {
        res.json({
            message: "Unauthorized",
            data: []
        })
    }
}

//UPDATE CURRENT RECIPE IN DATABASE
app.post('/api/updateRecipe', async (req,res) => {
    let { recipeName, steps, ingredients, uniqueId } = req.body
    // console.log(30,recipeName, steps, ingredients, uniqueId)
    await firebaseApp.firestore().doc(`/allRecipes/${uniqueId}`).update({
        recipeName,
        steps,
        ingredients,
        uniqueId
    })

    res.json("Successfully updated in the DB")
})

//GET CURRENT RECIPE
app.get('/api/getCurrentRecipe', async (req,res) => {
    let currentUniqueId = req.query.uniqueId
    let data = {}
    let response = await firebaseApp.firestore().collection('allRecipes').where('uniqueId',"==",currentUniqueId).get()
    response.forEach(item => {
        data = item.data()
    })
    res.json(data)
})

//GET ALL RECIPES FROM API
app.get('/api/getAllRecipes', verifyToken, (req,res) => {

    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if(err) {
            res.json({
                message: "Unauthorized",
                data: []
            })
        } else {
            let data = []
            let response = await firebaseApp.firestore().collection('allRecipes').get()
            response.forEach(item => {
                data.push(item.data())
            })
            res.json({
                data,
                authData,
                message: 'authorized'
            });
        }
    })
    
    
})

//CREATE RECIPE API
app.post('/api/createRecipe', async (req,res) => {
    let data = req.body
    let { uniqueId } = data
    await firebaseApp.firestore().collection('allRecipes').doc(uniqueId).set(
        { recipeName, ingredients, steps, chefName, uniqueId } = data
    )

    res.json("Successfully added the recipe")
})

//REGISTER A USER
app.post('/api/registerUser', async (req,res) => {
    let { email, password } = req.body
    let uniqueId = new Date().getTime()

    let loginData = []

    let reference = await firebaseApp.firestore().collection('userData').where('email','==',email).get()
    reference.forEach(item => {
        if(item) {
            loginData.push(item.data())
        }
    })
    if(loginData.length === 0) {
        await firebaseApp.firestore().collection('userData').doc(email).set({
            email,
            password,
            uniqueId
        })
        res.json("Successfully registered")
    } else {
        res.json("User already exists")
    }
    // console.log(95,loginData)
})

//LOGIN USER
app.post('/api/login', async (req,res) => {
    let { email, password } = req.body

    let userDetails = {}

    let reference = await firebaseApp.firestore().collection('userData').where('email','==',email).get()
    reference.forEach(item => {
        if(item) {
            userDetails["data"] = item.data()
        }
    })

    
    if((Object.keys(userDetails).length>0) && (userDetails.data.email === email && userDetails.data.password === password)) {
        jwt.sign({ user: email}, 'secretkey', (err, token) => {
            res.json({token})
        })
    } else {
        res.json({token: ""})
    }
})


//PORT LISTENING
app.listen(port, () => {
    console.log("Connection established, app listening to ",port)
})