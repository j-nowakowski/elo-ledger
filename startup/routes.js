const express = require('express');
const appuserRouter = require('../routes/app_users');
const authRouter = require('../routes/auth');
const validateJSON = require('../middleware/validate_json');

module.exports = function(app) {
  app.use(express.json());
  app.use(validateJSON);
  app.use('/api/app_users', appuserRouter);
  app.use('/api/auth', authRouter);
}