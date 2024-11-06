const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = 'mongodb://localhost:27017/bloodBridge'; // ضع رابط MongoDB الخاص بك هنا

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const User = require('./models/User');

// مسار تسجيل المستخدم الجديد
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // تحقق من تعبئة جميع الحقول
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // تحقق إذا كان المستخدم موجودًا بالفعل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // إنشاء مستخدم جديد
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // إنشاء JWT
    const token = jwt.sign({ id: newUser._id }, 'your_jwt_secret', {
      expiresIn: 3600, // ساعة واحدة
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// مسار لعرض جميع المستخدمين
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email'); // إحضار الحقول التي تريد عرضها فقط
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
