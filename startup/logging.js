require('express-async-errors');

module.exports = function () {
  process.on('unhandledRejection', (ex) => {
    console.log(ex);
    throw ex;
  })

  process.on('uncaughtException', (ex) => {
    console.log(ex);
    throw ex;
  })
};