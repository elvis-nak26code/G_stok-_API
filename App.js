const express = require('express');
const app =express();
app.use(express.json());

//router principale
const routes=require('./routes/routeDeGestion');

const mongoose = require('mongoose');

app.use('/api/edit', routes);

mongoose.connect('mongodb+srv://Elvis:G_stok2626@cluster0.jh9ltkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(()=>console.log("connection a mongodb reissi"))
    .catch((err)=>console.log("connection a mongodb echouee",err));

module.exports = app;