const express = require('express');
const sql = require('mssql');
const cors = require('cors');
//require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Azure SQL Database configuration
const config = {
    user: "pawfectadmin",
    password: "Password!123",
    server: "pawfectfinddb.database.windows.net", // e.g., 'yourserver.database.windows.net'
    database: "pawfectfinddb",
    options: {
        encrypt: true, // Required for Azure
        trustServerCertificate: false
    }
};

// Create connection pool
let poolPromise = sql.connect(config)
    .then(pool => {
        console.log('Connected to Azure SQL Database');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed:', err);
        process.exit(1);
    });

// GET all events
app.get('/api/events', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT id, date, title FROM events ORDER BY date');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET events for a specific date
app.get('/api/events/date/:date', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('date', sql.VarChar, req.params.date)
            .query('SELECT id, date, title FROM events WHERE date = @date');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// POST new event
app.post('/api/events', async (req, res) => {
    const { date, title } = req.body;
    
    if (!date || !title) {
        return res.status(400).json({ error: 'Date and title are required' });
    }
    
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('date', sql.VarChar, date)
            .input('title', sql.VarChar, title)
            .query('INSERT INTO events (date, title) OUTPUT INSERTED.id VALUES (@date, @title)');
        
        res.status(201).json({ 
            id: result.recordset[0].id,
            date, 
            title 
        });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// DELETE event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM events WHERE id = @id');
        
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// DELETE event by date (for your existing frontend logic)
app.delete('/api/events/date/:date', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('date', sql.VarChar, req.params.date)
            .query('DELETE FROM events WHERE date = @date');
        
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});