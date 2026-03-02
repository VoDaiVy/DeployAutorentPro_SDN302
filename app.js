const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session'); 
const app = express();

const Car = require('./models/Car');
const Booking = require('./models/Booking');
const User = require('./models/User');

const carRoutes = require('./routes/cars');
const authRoutes = require('./routes/auth'); 
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin'); 
const ownerRoutes = require('./routes/owner');

const dbURL = process.env.MONGODB_URI || 'mongodb+srv://VoDaiVy:Daivyluonnoluc1324@chapter6sdn302.ixjjuz5.mongodb.net/autorent_pro';

mongoose.connect(dbURL)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('DB Error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'mySecretKey', 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use('/users', userRoutes);
app.use('/cars', carRoutes);
app.use('/auth', authRoutes); 
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes); 
app.use('/owner', ownerRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server chạy tại port: ${port}`);
});