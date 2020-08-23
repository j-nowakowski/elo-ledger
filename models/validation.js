var validation = {};

validation.passedObject = function() {
  return {
    passed: true
  }
};

validation.failedObject = function() {
  return {
    passed: false,
    message: 'Task failed.',
    status: 400
  }
};

module.exports = validation;