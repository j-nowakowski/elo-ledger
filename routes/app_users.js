const express = require('express');
const router = express.Router();
const app_user = require('../models/app_user');
const _ = require('lodash');

router.post('/', async (req, res) => {
  const req_properties = ['username', 'email', 'password']
  console.log(req);
  // Verify Request Structure
  if (!req) { return res.status(400).send('Request is required.') }
  if (!req.body) { return res.status(400) }
  req_properties.forEach(property => {
    if(!req.body[property]) { return res.status(400).send(`Request body property is required: "${property}".`) }
  })

  // Verify Request Content
  if (!req.body.role) { req.body.role = "member"; };
  var val = await app_user.validateNewAppUser(req.body);
  if (!val.passed) {
    return res.status(val.status).send(val.message);
  };

  // Post to database
  const encryptedPassword = await app_user.encryptPassword(req.body.password);
  results = await app_user.insert(req.body.username, req.body.email, encryptedPassword, req.body.role, new Date());
  // TODO: Confirm insert was successful

  // Respond
  var response = _.pick(results.rows[0], ['user_id', 'username', 'email', 'role', 'created']);
  response.token = app_user.generateAuthToken(response.user_id);
  return res.status(200).send(response);
});




module.exports = router;