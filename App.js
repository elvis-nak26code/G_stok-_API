const express = require('express');
const app =express();
app.use(express.json());

//router principale
const routes=require('./routes/routeDeGestion');

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Elvis:G_stok2626@cluster0.jh9ltkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(()=>console.log("connection a mongodb reissi"))
    .catch((err)=>console.log("connection a mongodb echouee",err));

// gérer les erreurs CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );

    // répondre directement aux requêtes OPTIONS (préflight)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});  

app.use('/api/edit', routes);
module.exports = app;