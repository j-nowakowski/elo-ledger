const app_user = require("../../../models/app_user");
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passedObject = require('../../../models/validation').passedObject;
const failedObject = require('../../../models/validation').failedObject;

describe('authentication', () => {

  describe('generateAuthToken', () => {

    it('should return a valid JWT that matches when decoded with proper key', () => {
      const payload = { user_id: 1 };
      const token = app_user.generateAuthToken(1);
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      expect(decoded).toMatchObject(payload);
    });

    it('should return a valid JWT that throws exception when decoded with improper key', () => {
      const token = app_user.generateAuthToken(1);
      expect( () => { jwt.verify(token, 'wrongKey'); }).toThrow();
    });

  });

  describe('encryptPassword', () => {

    it('should return encryption that de-encrypts to original', async () => {
      const password = 'password';
      const encryptedPassword = await app_user.encryptPassword(password);
      const result = await bcrypt.compare(password, encryptedPassword);
      expect(result).toBeTruthy();
    });

    it('should not return encryption that de-encrypts to a different key', async () => {
      const encryptedPassword = await app_user.encryptPassword('password');
      const result = await bcrypt.compare('differentPassword', encryptedPassword);
      expect(result).toBeFalsy();
    });
    
  });
});

describe('validate', () => {
  var val;

  beforeEach( () => {
  });

  const expectFalseResponse = () => {
    expect(val.passed).toBeFalsy();
    expect(val.status).toEqual(400);
    expect(val).toHaveProperty('message');
  };

  describe('validateUsername', () => {

    it('should not pass if username is null', () => {
      val = app_user.validateUsername(null);
      expectFalseResponse();
    });

    it('should not pass if username is empty', () => {
      val = app_user.validateUsername('');
      expectFalseResponse();
    });

    it('should not pass if username more than 31 chars', () => {
      val = app_user.validateUsername('1'.repeat(32));
      expectFalseResponse();
    });

    it('should pass if good request', () => {
      val = app_user.validateUsername('username');
      expect(val.passed).toBeTruthy();
    });

  });

  describe('validateEmail', () => {
  
    it('should not pass if email is null', () => {
      val = app_user.validateEmail(null);
      expectFalseResponse();
    });
  
    it('should not pass if email is empty', () => {
      val = app_user.validateEmail('');
      expectFalseResponse();
    });
  
    it('should not pass if email more than 255 chars', () => {
      val = app_user.validateEmail('1'.repeat(256));
      expectFalseResponse();
    });
  
    it('should pass if good request', () => {
      val = app_user.validateEmail('email@gmail.com');
      expect(val.passed).toBeTruthy();
    });
  
  });

  describe('validatePassword', () => {

    it('should not pass if password is null', () => {
      val = app_user.validatePassword(null);
      expectFalseResponse();
    });
  
    it('should not pass if password is empty', () => {
      val = app_user.validatePassword('');
      expectFalseResponse();
    });
  
    it('should not pass if password more than 31 chars', () => {
      val = app_user.validatePassword('1'.repeat(32));
      expectFalseResponse();
    });
  
    it('should pass if good request', () => {
      val = app_user.validatePassword('password');
      expect(val.passed).toBeTruthy();
    });
  
  });

  describe('validateRole', () => {
  
    it('should not pass if not valid role', () => {
      val = app_user.validateRole('fake_role');
      expectFalseResponse();
    });
  
    it('should pass if good request', () => {
      val = app_user.validateRole('member');
      expect(val.passed).toBeTruthy();
    });
  
  });
});

describe('validateNewUsername', () => {

  let val
  let spy_validateUsername;
  let spy_usernameIsUnique;

  beforeEach( () => {
    spy_validateUsername = jest.spyOn(app_user, 'validateUsername').mockReturnValue(passedObject());
    spy_usernameIsUnique = jest.spyOn(app_user, 'usernameIsUnique').mockReturnValue(true);
  });

  afterEach( () => {
    jest.restoreAllMocks()
  })

  it('should pass if validateUsername and usernameIsUnique return true', async () => {
    val = await app_user.validateNewUsername(null);
    expect(spy_validateUsername.mock.calls.length).toBe(1);
    expect(spy_usernameIsUnique.mock.calls.length).toBe(1);
    expect(val).toMatchObject(passedObject());
  });

  it('should not pass and return failedObject if validateUsername is false', async () => {
    spy_validateUsername.mockReturnValue(failedObject());
    val = await app_user.validateNewUsername('username');
    expect(val).toMatchObject(failedObject());
  });

  it('should return false if usernameIsUnique is false', async () => {
    spy_usernameIsUnique.mockReturnValue(false);
    val = await app_user.validateNewUsername('username');
    expect(val.passed).toBeFalsy();
    expect(val.status).toBe(400);
    expect(val.message).toBeDefined();
  });

});


describe('validateNewEmail', () => {

  let val
  let spy_validateEmail;
  let spy_emailIsUnique;

  beforeEach( () => {
    spy_validateEmail = jest.spyOn(app_user, 'validateEmail').mockReturnValue(passedObject());
    spy_emailIsUnique = jest.spyOn(app_user, 'emailIsUnique').mockReturnValue(true);
  });

  afterEach( () => {
    jest.restoreAllMocks()
  })

  it('should pass if validateEmail and emailIsUnique return true', async () => {
    val = await app_user.validateNewEmail(null);
    expect(spy_validateEmail.mock.calls.length).toBe(1);
    expect(spy_emailIsUnique.mock.calls.length).toBe(1);
    expect(val).toMatchObject(passedObject());
  });

  it('should not pass and return failedObject if validateEmail is false', async () => {
    spy_validateEmail.mockReturnValue(failedObject());
    val = await app_user.validateNewEmail(null);
    expect(val).toMatchObject(failedObject());
  });

  it('should return false if emailIsUnique is false', async () => {
    spy_emailIsUnique.mockReturnValue(false);
    val = await app_user.validateNewEmail('email@email.com');
    expect(val.passed).toBeFalsy();
    expect(val.status).toBe(400);
    expect(val.message).toBeDefined();
  });

});


describe('validateNewRole', () => {

  let spy_validateRole;
  let spy_existsWithRole;

  beforeEach( () => {
    spy_validateRole = jest.spyOn(app_user, 'validateRole').mockReturnValue(passedObject());
    spy_existsWithRole = jest.spyOn(app_user, 'existsWithRole').mockReturnValue(false);
  });

  afterEach( () => {
    jest.restoreAllMocks()
  })

  it('should pass if validateRole and role is member', async () => {
    const val = await app_user.validateNewRole(null);
    expect(spy_validateRole.mock.calls.length).toBe(1);
    expect(spy_existsWithRole.mock.calls.length).toBe(0);
    expect(val).toMatchObject(passedObject());
  });

  it('should pass if validateRole is true, role is admin, and existsWithRole is false', async () => {
    const val = await app_user.validateNewRole('admin');
    expect(spy_validateRole.mock.calls.length).toBe(1);
    expect(spy_existsWithRole.mock.calls.length).toBe(1);
    expect(val).toMatchObject(passedObject());
  });

  it('should not pass if validateRole does not pass', async () => {
    spy_validateRole.mockReturnValue(failedObject());
    const val = await app_user.validateNewRole('member');
    expect(val).toMatchObject(failedObject());
  });

  it('should return false if validateRole is true, role is admin, and existsWithRole is true', async () => {
    spy_existsWithRole.mockReturnValue(true);
    const val = await app_user.validateNewRole('admin');
    expect(val.status).toBe(400);
    expect(val.message).toBeDefined();
    expect(val.passed).toBeFalsy();
  });

});


describe('validateNewAppUser', () => {

  let spy_validateNewUsername;
  let spy_validateNewEmail;
  let spy_validatePassword;
  let spy_validateNewRole;  

  beforeEach( () => {
    spy_validateNewUsername = jest.spyOn(app_user, 'validateNewUsername').mockReturnValue(passedObject());
    spy_validateNewEmail = jest.spyOn(app_user, 'validateNewEmail').mockReturnValue(passedObject());
    spy_validatePassword = jest.spyOn(app_user, 'validatePassword').mockReturnValue(passedObject());
    spy_validateNewRole = jest.spyOn(app_user, 'validateNewRole').mockReturnValue(passedObject());
  });

  afterAll( () => {
    jest.restoreAllMocks()
  })

  it('should pass if all component validation functions pass ', async () => {
    const val = await app_user.validateNewAppUser({});
    expect(spy_validateNewUsername.mock.calls.length).toBe(1);
    expect(spy_validateNewEmail.mock.calls.length).toBe(1);
    expect(spy_validatePassword.mock.calls.length).toBe(1);
    expect(spy_validateNewRole.mock.calls.length).toBe(1);
    expect(val).toMatchObject(passedObject());
  });

  it('should not pass if validateNewUsername does not pass', async () => {
    spy_validateNewUsername.mockReturnValue(failedObject());
    const val = await app_user.validateNewAppUser({});
    expect(val).toMatchObject(failedObject());
  });

  it('should not pass if validateNewEmail does not pass', async () => {
    spy_validateNewEmail.mockReturnValue(failedObject());
    const val = await app_user.validateNewAppUser({});
    expect(val).toMatchObject(failedObject());
  });
  
  it('should not pass if validatePassword does not pass', async () => {
    spy_validatePassword.mockReturnValue(failedObject());
    const val = await app_user.validateNewAppUser({});
    expect(val).toMatchObject(failedObject());
  });
  
  it('should not pass if validateNewRole does not pass', async () => {
    spy_validateNewRole.mockReturnValue(failedObject());
    const val = await app_user.validateNewAppUser({});
    expect(val).toMatchObject(failedObject());
  });

});


