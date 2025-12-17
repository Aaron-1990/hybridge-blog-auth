require('dotenv').config();
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(passport.initialize());

/* ==================== ESTRATEGIAS PASSPORT ==================== */

// Estrategia Local - Login con email/password
passport.use(
  'local',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    async (email, password, done) => {
      try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: 'Usuario no existe' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Estrategia JWT - Proteccion de rutas
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      session: false,
    },
    async (payload, done) => {
      try {
        const user = await db.User.findByPk(payload.id);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

/* ==================== RUTAS DE AUTENTICACION ==================== */

// Registro de usuarios
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      id: user.id,
      email: user.email,
      message: 'Usuario creado exitosamente',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login - Genera JWT
app.post(
  '/api/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const payload = { id: req.user.id, email: req.user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({
      token,
      token_type: 'Bearer',
      user: { id: req.user.id, email: req.user.email },
    });
  }
);

// Perfil protegido - Prueba de JWT
app.get(
  '/api/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      message: 'Acceso concedido',
    });
  }
);

/* ==================== RUTAS AUTHORS (PROTEGIDAS) ==================== */

// Listar autores - PUBLICO
app.get('/api/authors', async (req, res) => {
  try {
    const authors = await db.Author.findAll();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear autor - PROTEGIDO
app.post(
  '/api/authors',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { name, bio, birthdate } = req.body;
      const author = await db.Author.create({ name, bio, birthdate });
      res.status(201).json(author);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Editar autor - PROTEGIDO
app.put(
  '/api/authors/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, bio, birthdate } = req.body;
      const author = await db.Author.findByPk(id);
      if (!author) {
        return res.status(404).json({ error: 'Autor no encontrado' });
      }
      await author.update({ name, bio, birthdate });
      res.json(author);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Eliminar autor - PROTEGIDO
app.delete(
  '/api/authors/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const author = await db.Author.findByPk(id);
      if (!author) {
        return res.status(404).json({ error: 'Autor no encontrado' });
      }
      await author.destroy();
      res.json({ message: 'Autor eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* ==================== RUTAS POSTS (PROTEGIDAS) ==================== */

// Listar posts - PUBLICO
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await db.Post.findAll({
      include: [{ model: db.Author, as: 'author' }],
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear post - PROTEGIDO
app.post(
  '/api/posts',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { title, content, authorId } = req.body;
      const post = await db.Post.create({ title, content, authorId });
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Editar post - PROTEGIDO
app.put(
  '/api/posts/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, authorId } = req.body;
      const post = await db.Post.findByPk(id);
      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }
      await post.update({ title, content, authorId });
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Eliminar post - PROTEGIDO
app.delete(
  '/api/posts/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const post = await db.Post.findByPk(id);
      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }
      await post.destroy();
      res.json({ message: 'Post eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* ==================== SERVIDOR ==================== */

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
