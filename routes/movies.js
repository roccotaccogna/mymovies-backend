const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE - Aggiungi un nuovo film
router.post('/', async(req,res)=> {
    const { titolo, anno, genere, voto } = req.body;
    
    
    // Validazioni
    if(!titolo || typeof titolo != 'string' || titolo.trim() === ''){
        return res.status(400).json({ error: 'Il titolo è obbligatorio e deve essere una stringa'});
    };

    if(!anno || typeof anno != 'number' || anno < 1900 || anno > new Date().getFullYear()){
        return res.status(400).json({ error: 'Anno non valido'});
    };
    if(!genere || typeof genere != 'string'){
        return res.status(400).json({ error: 'Genere non valido'});
    };
    if(!voto || typeof voto != 'number' || voto < 1 || voto > 10){
        return res.status(400).json({ error: 'Il voto deve essere compreso tra 1 e 10'});
    };
    
    try {
        const [result] = await db.execute(
            'INSERT INTO movies (titolo, anno, genere, voto) VALUES (?, ?, ?, ?)',
            [titolo, anno, genere, voto]
        );

        res.status(201).json({
            id: result.insertId,
            titolo,
            anno,
            genere,
            voto
        });

    } catch (error) {
        console.error('Errore nel CREATE /movies: ', error);
        res.status(500).json({ error: 'Errore del server'});
    };
});

// READ - Ottieni tutti i film
// router.get('/', async (req,res)=> {
//     try {
//         const [rows] = await db.execute('SELECT * FROM movies ORDER BY id DESC');
//         res.json(rows);
//     } catch (error) {
//         console.error('Errore GET /movies: ', error);
//         res.status(500).json({ error: 'Errore del server' });
//     }
// });

// READ - Ottieni un film per id
router.get('/:id', async(req,res)=> {
    try {
        const {id} = req.params;
        const [rows] = await db.execute('SELECT * FROM movies WHERE id=?', [id]);
        
        if(rows.length === 0 ){
            return res.status(404).json({ error: 'Film non trovato'});
        };

        res.json(rows[0]);
    } catch (error) {
        console.error('Errore GET /movies/:id: ', error); 
        res.status(500).json({ error: 'Errore del server' });
    };
});

// UPDATE - Aggiorna un film
router.put('/:id', async(req,res)=> {
    const { id } = req.params;
    const { titolo, anno, genere, voto} = req.body;
    
    // Validazioni
    if(!titolo || typeof titolo != 'string' || titolo.trim() === ''){
        return res.status(400).json({ error: 'Il titolo è obbligatorio e deve essere una stringa'});
    };

    if(!anno || typeof anno != 'number' || anno < 1900 || anno > new Date().getFullYear()){
        return res.status(400).json({ error: 'Anno non valido'});
    };
    if(!genere || typeof genere != 'string'){
        return res.status(400).json({ error: 'Genere non valido'});
    };
    if(!voto || typeof voto != 'number' || voto < 1 || voto > 10){
        return res.status(400).json({ error: 'Il voto deve essere compreso tra 1 e 10'});
    };
    
    try {
        const [result] = await db.execute(
            'UPDATE movies SET titolo = ?, anno = ?, genere = ?, voto = ? WHERE id = ?',
           [titolo, anno, genere, voto, id]
        );

        if(result.affectedRows === 0 ){
            return res.status(404).json({error: 'Film non trovato'});
        };
        
        res.json({id, titolo, anno, genere, voto});
    } catch (error) {
        console.error('Errore PUT /movies/:id: ', error); 
        res.status(500).json({ error: 'Errore del server' });
    };
});

// DELETE - Elimina un film
router.delete('/:id', async(req,res)=> {
    try {
        const {id} = req.params;

        const [result] = await db.execute('DELETE FROM movies WHERE id = ?', [id]);

        if (result.affectedRows === 0) { 
            return res.status(404).json({ error: 'Film non trovato' }); 
        };

        res.json({ message: 'Film eliminato con successo'});
    } catch (error) {
        console.error('Errore DELETE /movies/:id:', error); 
        res.status(500).json({ error: 'Errore del server' });
    };
});

// PAGINAZIONE + FILTRO (GENERE / ANNO)
router.get('/', async (req, res) => {
    let { page = 1, limit = 10, genere, anno } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    let where = [];
    let params = [];

    if (genere) {
        where.push("genere = ?");
        params.push(genere);
    }

    if (anno) {
        where.push("anno = ?");
        params.push(anno);
    }

    const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

    try {
        const [rows] = await db.execute(
            `SELECT * FROM movies ${whereClause} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        const [[{ total }]] = await db.execute(
            `SELECT COUNT(*) AS total FROM movies ${whereClause}`,
            params
        );

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: rows
        });
    } catch (error) {
        console.error('Errore GET /movies: ', error);
        res.status(500).json({ error: 'Errore del server' });
    }
});


module.exports = router;