import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware de autenticação JWT
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token ausente" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// Rota de login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE email=$1", [email]);
  if (!rows.length) return res.status(400).json({ error: "Usuário não encontrado" });

  const user = rows[0];
  const ok = await bcrypt.compare(senha, user.senha_hash);
  if (!ok) return res.status(400).json({ error: "Senha incorreta" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

// Rota para listar propostas
app.get("/propostas", auth, async (req, res) => {
  const result = await pool.query("SELECT * FROM propostas ORDER BY criado_em DESC");
  res.json(result.rows);
});

app.listen(10000, () => console.log("✅ API rodando na porta 10000"));
