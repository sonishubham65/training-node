require('dotenv').config({ path: `./env/${process.env.ENVIRONMENT}.env` })
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var app = express();
app.use(cors({
  origin: process.env.ALLOWED_AUTH_ORIGIN,
  path: 'user/authorize',
  credentials: true
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

app.listen(process.env.PORT, () => {
  console.log(`Server is started on ${process.env.ENVIRONMENT}`);
})

module.exports = app;
