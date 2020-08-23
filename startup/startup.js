module.exports = function (app) {
  require('./logging')();
  require('./routes')(app);
};