const express = require('express');
const { Pool } = require('pg');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
})

app.use(express.json());

app.get('/resumes/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const { rows } = await pool.query('SELECT * FROM resumes WHERE id = $1', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Currículo não encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar currículo por ID' });
    }
  });
  
app.get('/resumes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM resumes');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter currículos' });
  }
});

app.post('/resumes', async (req, res) => {
  const { name, email, phone, address, summary, education, experience, skills } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO resumes (name, email, phone, address, summary, education, experience, skills) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, email, phone, address, summary, education, experience, skills]
    );
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar currículo' });
  }
});

app.put('/resumes/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, address, summary, education, experience, skills } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE resumes SET name=$1, email=$2, phone=$3, address=$4, summary=$5, education=$6, experience=$7, skills=$8 WHERE id=$9 RETURNING *',
      [name, email, phone, address, summary, education, experience, skills, id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar currículo' });
  }
});

app.delete('/resumes/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM resumes WHERE id=$1', [id]);
    res.json({ message: 'Currículo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar currículo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
