const app_user = require("../../../models/app_user");
const request = require('supertest');
const express = require('express');

let server;
let app;
const port = process.env.PORT || 5000;

describe('app_user routes', () => {

  let results;

  beforeEach(async () => {
    await cleanUp();
    app = express();
    require('../../../startup/startup')(app);
    server = app.listen(port);
  });

  afterEach(async () => {
    await cleanUp();
    jest.restoreAllMocks()
  });

  const cleanUp = async () => {
    if (server) { await server.close(); };
    global.process.removeAllListeners('unhandledRejection');
    global.process.removeAllListeners('uncaughtException');
  };

  describe('post new app_user', () => {

    let body;
    let spy_insert;  
    let spy_validateNewAppUser;

    beforeEach(() => {
      body = {
        username: "username",
        email: "email@gmail.com",
        password: "password",
        role: "member"
      };

      spy_insert = jest.spyOn(app_user, 'insert').mockImplementation(() => null);
      spy_validateNewAppUser = jest.spyOn(app_user, 'validateNewAppUser').mockImplementation(() => True);
    });

    const sendRequest = () => {
      return request(server)
        .post('/api/app_users')
        .send(body);
    };

    const expectStatusAndMessage = (status) => {
      expect(results.status).toBe(status);
      expect(results.text).toBeDefined();
      expect(results.text).not.toBe('');
      expect(spy_insert.mock.calls.length).toBe(0);
    };

    it('should send 400 if no req body', async () => {
      body = null;
      results = await sendRequest();
      // console.log(results);
      expectStatusAndMessage(400);

    });

    // it('should send 400 if req body has no username', async () => {
    //   delete body.username;
    //   results = await sendRequest();
    //   expectStatusAndMessage(400);
    // });
  
  });
});

