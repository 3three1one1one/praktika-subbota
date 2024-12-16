const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'public/text.sqlite',
});

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

sequelize.sync();

const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

const authByRoles = (roles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, '2315', (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Доступ запрещён' });
        }

        req.user = user;
        if (roles.includes(user.role)) {
          return next();
        } else {
          return res.status(403).json({ message: 'Тебе сюда нельзя' });
        }
      });
    } else {
      res
        .status(401)
        .json({ message: 'Токен не предоставлен. Ты не авторизован' });
    }
  };
};

app.get('/welcome', authByRoles(['user', 'admin']), (req, res) => {
  if (req.user.role === 'user') {
    res.send({ message: 'Добро пожаловать, пользователь!' });
  } else if (req.user.role === 'admin') {
    res.send({ message: 'Добро пожаловать, администратор!' });
  }
});

app.get('/posts', authByRoles(['user', 'admin']), async (req, res) => {
  const posts = await Post.findAll();
  res.json(posts);
});

app.post('/post', authByRoles(['admin']), async (req, res) => {
  const { title, content } = req.body;
  const newPost = await Post.create({ title, content });
  res.status(201).json(newPost);
});

app.delete('/post/:id', authByRoles(['admin']), async (req, res) => {
  const { id } = req.params;
  const deleted = await Post.destroy({ where: { id } });
  if (deleted) {
    res.json({ message: 'Пост удалён' });
  } else {
    res.status(404).json({ message: 'Пост не найден' });
  }
});

app.put('/post/:id', authByRoles(['admin']), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const post = await Post.findByPk(id);

  if (post) {
    post.title = title;
    post.content = content;
    await post.save();
    res.json(post);
  } else {
    res.status(404).json({ message: 'Пост не найден' });
  }
});

app.get('/profile', authByRoles(['user', 'admin']), async (req, res) => {
  const email = req.user.email;
  const user = await User.findOne({ where: { email } });
  res.send({ email: user.email, nickname: user.nickname });
});

app.get('/hello', authByRoles(['admin']), (req, res) => {
  res.send('Привет админ');
});

app.post('/register', async (req, res) => {
  const { email, nickname, password, role } = req.body;
  const user = await User.create({ email, nickname, password, role });

  const token = jwt.sign({ email, role }, '2315', { expiresIn: '30m' });
  res.send({ token });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.sendStatus(404);
  }

  if (user.password !== password) {
    return res.sendStatus(400);
  }

  const token = jwt.sign({ email, role: user.role }, '2315', {
    expiresIn: '30m',
  });
  res.send({ token });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
