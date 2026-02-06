const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
require('dotenv').config()

const PORT = process.env.PORT || 2121
const dbConnectionStr = process.env.DB_STRING || "mongodb+srv://kaighost65_db_user:XTMPdkziXrOhPkma@starwars.kpugoe8.mongodb.net/?appName=starwars"
const dbName = 'starwars'

let db

// Initialize Database Connection
async function connectDB() {
    try {
        const client = await MongoClient.connect(dbConnectionStr)
        db = client.db(dbName)
        console.log(`Connected to ${dbName} Database`)
        
        // Start server only after DB connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (err) {
        console.error('Database connection failed:', err.message)
        process.exit(1)
    }
}

connectDB()

// Middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes
app.get('/', async (req, res) => {
    try {
        const todoItems = await db.collection('starwars').find().toArray()
        const itemsLeft = await db.collection('starwars').countDocuments({ completed: false })
        res.render('index.ejs', { items: todoItems, left: itemsLeft })
    } catch (err) {
        console.error(err)
        res.status(500).send('Internal Server Error')
    }
})

app.post('/addTodo', async (req, res) => {
    try {
        await db.collection('starwars').insertOne({
            thing: req.body.todoItem,
            completed: false
        })
        console.log('Todo added!')
        res.redirect('/')
    } catch (err) {
        console.error(err)
        res.status(500).redirect('/')
    }
})

app.put('/markComplete', async (req, res) => {
    try {
        await db.collection('starwars').updateOne(
            { thing: req.body.itemFromJS },
            { $set: { completed: true } },
            { sort: { _id: -1 }, upsert: false }
        )
        console.log('Marked Complete')
        res.json('Marked Complete')
    } catch (err) {
        console.error(err)
        res.status(500).json(err.message)
    }
})

app.put('/markUnComplete', async (req, res) => {
    try {
        await db.collection('starwars').updateOne(
            { thing: req.body.itemFromJS },
            { $set: { completed: false } },
            { sort: { _id: -1 }, upsert: false }
        )
        console.log('Marked Uncomplete')
        res.json('Marked Uncomplete')
    } catch (err) {
        console.error(err)
        res.status(500).json(err.message)
    }
})

app.delete('/deleteItem', async (req, res) => {
    try {
        await db.collection('starwars').deleteOne({ thing: req.body.itemFromJS })
        console.log('Todo Deleted')
        res.json('Todo Deleted')
    } catch (err) {
        console.error(err)
        res.status(500).json(err.message)
    }
})