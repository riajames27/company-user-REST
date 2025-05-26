const express = require('express');
const router = express.Router();
const db = require('../config/db');

// List users
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Get users error:', err);
      return res.status(500).json({ error: 'Database error fetching users' });
    }
    res.json(results);
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.error('Get user error:', err);
      return res.status(500).json({ error: 'Database error fetching user' });
    }
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// Create user
router.post('/', (req, res) => {
  let { first_name, last_name, email, designation, date_of_birth, active, company_id } = req.body;
  active = active === undefined ? 1 : active ? 1 : 0; // Convert to tinyint

  db.query(
    'INSERT INTO users (first_name, last_name, email, designation, date_of_birth, active, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [first_name, last_name, email, designation, date_of_birth, active, company_id],
    (err, results) => {
      if (err) {
        console.error('Create user error:', err);
        return res.status(500).json({ error: 'Database error creating user', details: err.sqlMessage });
      }
      res.status(201).json({
        id: results.insertId,
        first_name,
        last_name,
        email,
        designation,
        date_of_birth,
        active: Boolean(active),
        company_id,
      });
    }
  );
});

// Update user (supports partial update)
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const allowedFields = ['first_name', 'last_name', 'email', 'designation', 'date_of_birth', 'active', 'company_id'];
  const updates = [];
  const values = [];

  console.log('Update user payload:', req.body);

  for (const field of allowedFields) {
    if (req.body.hasOwnProperty(field)) {
      if (field === 'active') {
        const val = req.body.active;
        const boolVal = val === true || val === 'true' || val === 1 || val === '1';
        updates.push(`active = ?`);
        values.push(boolVal ? 1 : 0);
      } else if (field === 'company_id') {
        const val = Number(req.body.company_id);
        if (isNaN(val)) {
          return res.status(400).json({ error: 'company_id must be a number' });
        }
        updates.push('company_id = ?');
        values.push(val);
      } else {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' });
  }

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  values.push(userId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ error: 'Database error updating user', details: err.sqlMessage });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Deactivate user
router.patch('/:id/deactivate', (req, res) => {
  db.query('UPDATE users SET active = 0 WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Deactivate user error:', err);
      return res.status(500).json({ error: 'Database error deactivating user' });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated' });
  });
});

// Delete user
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ error: 'Database error deleting user' });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;
