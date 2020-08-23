const config = require('config');
const express = require('express');
const app = express();
if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }

require('./startup/startup')(app)

const port = process.env.PORT || 5000;
app.listen(port, () => { console.log(`Listening on port ${port}, ${config.get('db').database}`); });


//  For testing queries:

// const app_users = require('./sql/app_users')
// async function f () {
//   const result = await app_users.existsWithRole('admin');
//   console.log(result);
// }
// f();