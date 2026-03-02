const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session'); 
const http = require('http'); 
const https = require('https');
const fs = require('fs'); 

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

if (process.env.NODE_ENV !== 'production') {
    try {
        const sslOptions = {
            key: fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
            cert: fs.readFileSync(path.join(__dirname, 'cert', 'server.crt'))
        };

        const HTTPS_PORT = 443;

        https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
            console.log(`Local HTTPS Server bảo mật đang chạy tại: https://localhost:${HTTPS_PORT}`);
        });

        http.createServer((req, res) => {
            const host = req.headers.host.split(':')[0]; 
            res.writeHead(301, { "Location": `https://${host}:${HTTPS_PORT}${req.url}` }); 
            res.end();
        });

    } catch (err) {
        console.error("LỖI: Không tìm thấy file chứng chỉ trong thư mục /cert. Hãy đảm bảo bạn đã chạy OpenSSL.");
    }
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server đang chạy ổn định tại cổng ${PORT}`);
    });
}