require('dotenv').config({ path: `./env/${process.env.ENVIRONMENT}.env` })
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

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
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
/**
 * Database connection with mongoose
 */
const mongoose = require('mongoose');
mongoose.connect(`${process.env.DBURI}`, { useNewUrlParser: true, useUnifiedTopology: true });

var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(process.env.PORT, () => {
  console.log(`Server is started on ${process.env.ENVIRONMENT}`);
})
let colors = ['#F43109', '#09B9F4', '#DF09F4', '#0AF409', '#F4F309']
setInterval(() => {
  let random = Math.floor(Math.random() * ((colors.length - 1) - 0 + 1)) + 0
  let dateObj = new Date();
  let dateTime = `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()} ${dateObj.getDate()}-${dateObj.getMonth()}-${dateObj.getFullYear()}`
  let message = {
    time: dateTime,
    color: colors[random]
  };
  io.to('timer').emit("watch", message)
}, 1000);

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  socket.join('timer');
  socket.on('disconnect', () => {
    console.log("disconnect.", socket.id);
  })
});

module.exports = app;
