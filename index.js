const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());


const client = new Client({
  host: 'localhost',
  user: 'postgres', 
  password: 'Carms@20', 
  database: 'postgres',
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error:', err.stack));

app.post('/products', async (req, res) => {
  const { name, description, price, quantity, category } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO products (name, description, price, quantity, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, quantity, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/', (req, res) => {
    res.send('Hello');
  });

app.get('/products', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM products');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});


app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity, category } = req.body;
  try {
    const result = await client.query(
      'UPDATE products SET name = $1, description = $2, price = $3, quantity = $4, category = $5 WHERE id = $6 RETURNING *',
      [name, description, price, quantity, category, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});


app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json({ message: 'Product deleted successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});