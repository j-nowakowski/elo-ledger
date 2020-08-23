const request = require('supertest');
const app_user = require('../../../models/app_user');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');

let server;
let app;
const port = process.env.PORT || 5000;

describe('app_user', () => {

  beforeEach(async () => {
    await cleanUp();
    app = express();
    require('../../../startup/startup')(app);
    server = app.listen(port);
  });

  afterEach(async () => {
    await cleanUp();
  });

  const cleanUp = async () => {
    await app_user.truncate();
    if (server) { await server.close(); };
    global.process.removeAllListeners('unhandledRejection');
    global.process.removeAllListeners('uncaughtException');
  };

  describe('database calls', () => {

    let db_response;
    let curr_date;
    let model;

    beforeEach( () => {
      result_row = {};
      curr_date = new Date();
      model = {
        username: 'username',
        email: 'email@gmail.com',
        role: 'member',
        created: curr_date
      };
    });

    const compareToModel = () => {
      expect(db_response.rowCount).toBe(1);
      expect(db_response.rows[0]).toMatchObject(model);
      expect(db_response.rows[0].password).not.toBeDefined();
    };


    describe('selectAll', () => {
      it('should return no records if table is empty', async () => {
        let response = await app_user.selectAll();
        expect(response.rowCount).toBe(0);
        response = await app_user.selectAll_Testing();
        expect(response.rowCount).toBe(0);
      });
    });

    describe('insert', () => {

      it('should return user_id, and selectAll should find user', async () => {
        model.password = 'password';
        const insert_response = await app_user.insert(model.username, model.email, model.password, model.role, model.created);
        expect(insert_response.rowCount).toBe(1);
        model.user_id = insert_response.rows[0].user_id;
        db_response = await app_user.selectAll_Testing(); // test password matches
        expect(db_response.rowCount).toBe(1);
        expect(db_response.rows[0]).toMatchObject(model);
        db_response = await app_user.selectAll();
        delete model.password;
        compareToModel();
      });
    });

    describe('selectByUsername', () => {
      it('should return app user data if username exists', async () => {
        const insert_response = await app_user.insert(model.username, model.email, 'password', model.role, model.created);
        model.user_id = insert_response.rows[0].user_id;
        db_response = await app_user.selectByUsername(model.username);
        compareToModel();
      });

      it('should return nothing if username does not exist', async () => {
        await app_user.insert('username', model.email, 'password', model.role, model.created);
        db_response = await app_user.selectByUsername('differentUsername');
        expect(db_response.rowCount === 0);
      });
    });

    describe('selectByEmail', () => {
      it('should return app user data if email exists', async () => {
        const insert_response = await app_user.insert(model.username, model.email, 'password', model.role, model.created);
        model.user_id = insert_response.rows[0].user_id;
        db_response = await app_user.selectByEmail(model.email);
        compareToModel();
      });

      it('should return nothing if email does not exist', async () => {
        await app_user.insert(model.username, 'email@gmail.com', 'password', model.role, model.created);
        db_response = await app_user.selectByEmail('differentEmail@gmail.com0');
        expect(db_response.rowCount === 0);
      });
    });

    describe('usernameIsUnique', () => {
  
      it('should return false if username exists', async () => {
        await app_user.insert(model.username, model.email, 'password', model.role, model.created);
        const result = await app_user.usernameIsUnique(model.username);
        expect(result).toBeFalsy();
      });

      it('should return true if username is new', async () => {
        await app_user.insert('username', model.email, 'password', model.role, model.created);
        const result = await app_user.usernameIsUnique('differentUsername');
        expect(result).toBeTruthy();
      });
  
    });

    describe('emailIsUnique', () => {
  
      it('should return false if email exists', async () => {
        await app_user.insert(model.username, model.email, 'password', model.role, model.created);
        const result = await app_user.emailIsUnique(model.email);
        expect(result).toBeFalsy();
      });

      it('should return true if email is new', async () => {
        await app_user.insert(model.username, 'email@gmail.com', 'password', model.role, model.created);
        const result = await app_user.emailIsUnique('differentEmail@gmail.com');
        expect(result).toBeTruthy();
      });
  
    });

    describe('existsWithRole', () => {
  
      it('should return false if no user with role exists', async () => {
        await app_user.insert(model.username, model.email, 'password', "member", model.created);
        const result = await app_user.existsWithRole("admin");
        expect(result).toBeFalsy();
      });

      it('should return true if user with role exists', async () => {
        await app_user.insert(model.username, model.email, 'password', model.role, model.created);
        const result = await app_user.existsWithRole(model.role);
        expect(result).toBeTruthy();
      });
  
    });

    describe('getTotalCount', () => {
  
      it('should return count', async () => {
        let result = await app_user.getTotalCount();
        expect(result).toBe(0);
        await app_user.insert('username1', 'email1', 'password', model.role, model.created);
        result = await app_user.getTotalCount();
        expect(result).toBe(1);
        await app_user.insert('username2', 'email2', 'password', model.role, model.created);
        result = await app_user.getTotalCount();
        expect(result).toBe(2);

      });  
    });
  
  });

});



// describe('/api/app_users', () => {

//   let res;
//   let userInDb;

//   beforeEach(async () => {
//     await cleanUp();
//     app = express();
//     require('../../startup/startup')(app);
//     server = app.listen(port);

//     body = {
//       username: '12345',
//       email: 'test@gmail.com',
//       password: 'password',
//       role: 'member'
//     };
//   });

//   afterEach(async () => {
//     await cleanUp();
//   });

//   const cleanUp = async () => {
//     await app_user.truncate();
//     if (server) { await server.close(); };
//     global.process.removeAllListeners('unhandledRejection');
//     global.process.removeAllListeners('uncaughtException');
//   }

//   const sendRequest = () => {
//     return request(server)
//       .post('/api/app_users')
//       .send(body)
//       ;
//   };

//   const recordsExistInTable = async () => {
//     const recordsInTable = await app_user.selectAll();
//     return recordsInTable > 0 ? true : false;
//   };

//   const userInDbMatchesBody = async () => {
//     expect(userInDb.rowCount).toBe(1);
//     expect(userInDb.rows[0].username).toBe(body.username);
//     expect(userInDb.rows[0].email).toBe(body.email);
//     expect(userInDb.rows[0].role).toBe(body.role);
//     expect(userInDb.rows[0].user_id).toBe(body.user_id);
//     expect(userInDb.rows[0].created).toEqual(body.created);
//   };

//   const responseMatchesBody = () => {
//     // expect(res.body.username).toBe(body.username);
//     // expect(res.body.email).toBe(body.email);
//     // expect(res.body.role).toBe(body.role);
//     expect(res.body.user_id).toBeDefined();
//     expect(res.body.password).not.toBeDefined();
//     // const diff = new Date() - Date.parse(res.body.created);
//     // expect(diff).toBeLessThan(10*1000) // 10 seconds
//     expect(res.status).toBe(200);
//   };

//   const validateJWT = () => {
//     expect(res.body.token).toBeDefined();
//     decoded = decodeJWT(res.body.token);
//     expect(res.body.user_id).toEqual(decoded.user_id);
//   }

//   const decodeJWT = (token) => {
//     try {
//       const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
//       return decoded;
//     }
//     catch (ex) {
//       return {user_id: ""}
//     }
//   }

//   const syncBodyWithResponse = () => {
//     body.user_id = res.body.user_id;
//     body.created = new Date(res.body.created);
//   }

//   const expectStatusAndNoRows = async (status) => {
//     expect(res.status).toBe(status);
//     expect(await recordsExistInTable()).toBeFalsy();
//   }

//   it('should return 400 if username is not provided', async () => {
//     body.username = '';
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if username already exists', async () => {
//     await sendRequest();
//     body.email = 'aDifferentEmail@gmail.com'
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if username length > 31', async () => {
//     body.username = '1'.repeat(32);
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if email is not provided', async () => {
//     body.email = '';
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if email already exists', async () => {
//     await sendRequest();
//     body.username = 'aDifferentUsername'
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if email length > 255', async () => {
//     body.email = '1'.repeat(256);
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if password is not provided', async () => {
//     body.password = '';
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if password length > 31', async () => {
//     body.password = '1'.repeat(32);
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 200 and allow role of "member" to be set, when request is valid', async () => {
//     res = await sendRequest();
//     responseMatchesBody();
//     syncBodyWithResponse();
//     userInDb = await app_user.selectAll();
//     userInDbMatchesBody();
//     validateJWT();
//   });

//   it('should set role to "member" if no role specified', async () => {
//     body.role = '';
//     res = await sendRequest();
//     body.role = 'member';
//     responseMatchesBody();
//     syncBodyWithResponse();
//     userInDb = await app_user.selectAll();
//     userInDbMatchesBody();
//     validateJWT();
//   });

//   it('should allow role of "admin" set if no admins exist', async () => {
//     body.role = 'admin';
//     res = await sendRequest();
//     responseMatchesBody();
//     syncBodyWithResponse();
//     userInDb = await app_user.selectAll();
//     userInDbMatchesBody();
//     validateJWT();
//   });

//   it('should return 400 if bad role is provided', async () => {
//     body.role = 'fakeRole';
//     res = await sendRequest();
//     await expectStatusAndNoRows(400);
//   });

//   it('should return 400 if request is "admin" and a record with "admin" already exists.', async () => {
//     body.role = 'admin';
//     await sendRequest();
//     body.username = 'newName';
//     body.email = 'newEmail';
//     res = await sendRequest();
//     expect(res.status).toBe(400);
//     expect(await app_user.getTotalCount()).toBe(1);  // Only the first admin should exist
//   });
    /*
  Post
  - should return 400 if request is "admin" and a record with "admin" already exists.
*/

// })
