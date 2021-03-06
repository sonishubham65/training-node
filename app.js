require('dotenv').config({ path: `./env/${process.env.ENVIRONMENT}.env` })
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var app = express();
app.use(cors({
  //origin: process.env.ALLOWED_AUTH_ORIGIN,
  origin: true,
  path: ['user/login', 'user/login'],
  credentials: true,
  maxAge: 3600
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/employee/', require('./routes/employee/'));
app.use('/manager/', require('./routes/manager/'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err.message);
  res.status(500).json({
    message: "Something went wrong."
  })
});
/**
 * Database connection with mongoose
 */
const mongoose = require('mongoose');
mongoose.connect(`${process.env.DBURI}`, { useNewUrlParser: true, useUnifiedTopology: true });

var http = require('http').createServer(app);
global.io = require('socket.io')(http);

http.listen(process.env.PORT, () => {
  console.log(`Server is started on ${process.env.ENVIRONMENT}`);
})
let colors = ['#F43109', '#09B9F4', '#DF09F4', '#0AF409', '#F4F309']
let i = 0;
setInterval(() => {
  i++;
  let random = Math.floor(Math.random() * ((colors.length - 1) - 0 + 1)) + 0
  let dateObj = new Date();
  let dateTime = `
  ${dateObj.getHours().toString().padStart(2, 0)}:${dateObj.getMinutes().toString().padStart(2, 0)}:${dateObj.getSeconds().toString().padStart(2, 0)} ${dateObj.getDate().toString().padStart(2, 0)}-${dateObj.getMonth().toString().padStart(2, 0)}-${dateObj.getFullYear().toString()}`

  io.of('/').emit('timer', dateTime);
  if (i % 5 == 0) {
    io.of('/').emit('color', colors[random]);
  }

}, 1000);
const Socket = require('./models/Socket');
const JWT = require('jsonwebtoken');
io.on('connection', (socket) => {
  try {
    let token = socket.handshake.query.token;
    if (token.trim() != 'undefined') {
      let result = JWT.verify(token, process.env.JWT_passphrase);
      Socket.create({
        user_id: result._id,
        socket_id: socket.id
      });
    }
    console.log(`a new user connected.`, socket.id);
    socket.on('disconnect', () => {
      console.log("User disconnected.", socket.id);
      Socket.deleteOne({
        socket_id: socket.id
      }).then((data) => {

      });
    })
  } catch (e) {
    console.log(e.message)
  }

});

module.exports = app;
