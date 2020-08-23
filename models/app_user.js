const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const passedObject = require('./validation').passedObject;
var app_user = {};

// []------------------------- Constants -------------------------[]

const role_types = ["member", "moderator", "admin"];

// []------------------------- Validation -------------------------[]

app_user.validateUsername = function(username) {
  let val = {
    passed: false,
    status: 400
  };

  if (!username) { 
    val.message = 'Username must exist.';
    return val;
  };

  if (username.length > 31) { 
    val.message = 'Username cannot be more than 31 characters.';
    return val;
  };
  
  return passedObject();
};

app_user.validateEmail = function(email) {
  let val = {
    passed: false,
    status: 400
  };

  if (!email) { 
    val.message = 'Email must exist.';
    return val;
  };

  if (email.length > 255) { 
    val.message = 'Email cannot be more than 255 characters.';
    return val;
  };
  
  return passedObject();
};

app_user.validatePassword = function(password) {    
  let val = {
    passed: false,
    status: 400
  };

  if (!password) { 
    val.message = 'Password must exist.';
    return val;
  };

  if (password.length > 31) { 
    val.message = 'Password cannot be more than 31 characters.';
    return val;
  };

  return passedObject();
};

app_user.validateRole = function(role, results = {}) {
  let val = {
    passed: false,
    status: 400
  };

  if (!role) { 
    val.message = 'Role must exist.';
    return val;
  };

  if (!role_types.includes(role)) {
    val.message = 'Invalid role requested.';
    return val;
  };

  return passedObject();
};

app_user.usernameIsUnique = async function(username) {
  const count = (await app_user.selectByUsername(username)).rowCount;
  return count > 0 ? false : true;
};

app_user.emailIsUnique = async function(email) {
  const count = (await app_user.selectByEmail(email)).rowCount;
  return count > 0 ? false : true;
};

app_user.validateNewUsername = async function(username) {
  let val

  val = app_user.validateUsername(username);
  if (!val.passed) { return val; };

  if (!await app_user.usernameIsUnique(username)) { 
    return {
      passed: false,
      status: 400,
      message: 'Username already exists.'
    };
  };

  return passedObject()
};

app_user.validateNewEmail = async function(email) {
  let val;

  val = app_user.validateEmail(email);
  if (!val.passed) { return val; };

  if (!await app_user.emailIsUnique(email)) { 
    return {
      passed: false,
      status: 400,
      message: 'Email already exists.'
    };
  };

  return passedObject()
};

app_user.validateNewRole = async function(role) {
  let val;

  val = app_user.validateRole(role);
  if (!val.passed) { return val; };

  if (role === "admin" && await app_user.existsWithRole("admin")) { 
    return {
      passed: false,
      status: 400,
      message: 'Admin already exists.'
    };
  };

  return passedObject()
};

app_user.validateNewAppUser = async function(user) {
  let val

  val = await app_user.validateNewUsername(user.username);
  if (!val.passed) { return val; };

  val = await app_user.validateNewEmail(user.email);
  if (!val.passed) { return val; };

  val = app_user.validatePassword(user.password);
  if (!val.passed) { return val; };

  val = await app_user.validateNewRole(user.role);
  if (!val.passed) { return val; };

  return passedObject();
};


// []------------------------- Authentication -------------------------[]

app_user.encryptPassword = async function(password) {
  return await bcrypt.hash(password, await bcrypt.genSalt(10));
};

app_user.generateAuthToken = function(user_id) {
  if (!user_id) { throw new Error('User_Id is required.'); };
  return jwt.sign({
    user_id: user_id
  }, config.get('jwtPrivateKey'));
};

app_user.getByUsernamePassword = async function(username, password, results = {}) {

  const response = await app_user.selectByUsername(username);
  if (response.rowCount === 0) {
    results.message = 'Invalid username or password.';
    results.status = 400;
    return;
  };

  const loginIsValid = await bcrypt.compare(password, response.rows[0].password);
  if (!loginIsValid) {
    results.message = 'Invalid username or password.';
    results.status = 400;
    return;
  };

  return _.pick(response.rows[0], ['user_id', 'username', 'email', 'role', 'created']);
};

// []------------------------- Database -------------------------[]

app_user.insert = async function(username, email, password, role, created) {
  return pool.query(
    'INSERT INTO public.app_user(username, email, password, role, created) VALUES ($1, $2, $3, $4, $5) RETURNING user_id', 
    [username, email, password, role, created]
  );
};

app_user.selectByUsername = async function(username) {
  return pool.query(
    'SELECT user_id, username, email, role, created FROM public.app_user WHERE username = $1', 
    [username]
  );
};

app_user.selectByEmail = async function(email) {
  return pool.query(
    'SELECT user_id, username, email, role, created FROM public.app_user WHERE email = $1', 
    [email]
  );
};

app_user.selectByUserId = async function(userId) {
  return pool.query(
    'SELECT user_id, username, email, role, created FROM public.app_user WHERE user_id = $1', 
    [userId]
  );
};

app_user.existsWithRole = async function(role) {
  const results = await pool.query(
    'SELECT 1 FROM public.app_user WHERE role = $1 LIMIT 1',
    [role]
  );
  return results.rowCount > 0 ? true : false;
};

app_user.selectAll = async function() {
  return pool.query(
    'SELECT user_id, username, email, role, created FROM public.app_user', 
    []
  );
};

app_user.getTotalCount = async function() {
  const results = await pool.query(
    'SELECT COUNT(1) AS total_count FROM public.app_user', 
    []
  );
  return parseInt(results.rows[0].total_count);
};

app_user.selectAll_Testing = async function() {
  if (process.env.NODE_ENV !== 'test') { throw new Error('Can only truncate in test environment!')};
  return pool.query(
    'SELECT user_id, username, email, password, role, created FROM public.app_user', 
    []
  );
};

app_user.truncate = async function() {
  if (process.env.NODE_ENV !== 'test') { throw new Error('Can only truncate in test environment!')};
  return pool.query('TRUNCATE public.app_user');
};

module.exports = app_user;

