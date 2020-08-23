const express = require('express');
const router = express.Router();
const App_User = require('../models/app_user');

router.post('/', async (req, res) => {
  // Verify username
  if (!req.body.username) { return res.status(400).send('Request missing username.') };

  // Verify password
  if (!req.body.password) { return res.status(400).send('Request missing password.') };

  // Verify username and password
  const results = await App_User.getByUsernamePassword(req.body.username, req.body.password);
  const app_user = results.app_user;
  if (!app_user) return res.status(results.status).send(results.message);

  const token = app_user.generateAuthToken();
  return res.send(token);
});


module.exports = router;