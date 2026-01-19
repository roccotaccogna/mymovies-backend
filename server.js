const express = require('express');
const cors = require('cors');
require('dotenv').config();

const moviesRouter = require('./routes/movies');

const app = express();
const PORT = process.env.PORT || '3001';

//Middleware
app.use(cors());
app.use(express.json());

//Ruote di test
app.get('/api/health', (req,res)=> {
    res.json({ 
        status: 'ok',
        message: 'MyMovies API is running'
    });
});

//Route movies
app.use('/api/movies', moviesRouter);

app.listen(PORT, ()=> {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});