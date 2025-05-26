const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');

// Async function to get lat,long from address using OpenStreetMap Nominatim API
async function getCoordinates(address) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User -Agent': 'company-user-management-app'
            }
        });
        const data = response.data;
        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            };
        } else {
            return { latitude: null, longitude: null };
        }
    } catch (error) {
        console.error('Geocoding API error:', error.message);
        return { latitude: null, longitude: null };
    }
}

// List companies
router.get('/', (req, res) => {
    db.query('SELECT * FROM companies', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get a specific company by ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM companies WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'Company not found' });
        res.json(results[0]);
    });
});

// Create a company
router.post('/', async (req, res) => {
    const { name, address } = req.body;
    if (!name || !address) {
        return res.status(400).json({ message: 'Name and address are required' });
    }
    const coords = await getCoordinates(address);
    db.query(
        'INSERT INTO companies (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
        [name, address, coords.latitude, coords.longitude],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({ id: results.insertId, name, address, latitude: coords.latitude, longitude: coords.longitude });
        }
    );
});

// Update a company
router.put('/:id', async (req, res) => {
    const { name, address } = req.body;
    if (!name || !address) {
        return res.status(400).json({ message: 'Name and address are required' });
    }
    const coords = await getCoordinates(address);
    db.query(
        'UPDATE companies SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?',
        [name, address, coords.latitude, coords.longitude, req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Company updated', latitude: coords.latitude, longitude: coords.longitude });
        }
    );
});

// Delete a company
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM companies WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Company deleted' });
    });
});

module.exports = router;
