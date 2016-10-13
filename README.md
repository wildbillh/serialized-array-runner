#SerializedArrayRunner

_A promise enabled, ES6 Class for serially calling asynchronous functions, to operate on array data._

##Synopsis

Execute statements serially, throwing away any resolved data (such as database inserts):

```javascipt
let SerializedArrayRunner = require('serial-array-runner');
let s = new SerializedArrayRunner(SerializedArrayRunner.LAST_RETURN);
s.run(arrayToIterate, functionToCall, scope, dbConnection)
    .then( (results) => {
        // Used this way, results contains the data from the last function call.
        // If all function calls resolve, we get here. Otherwise, rejected.
        // For each element in the array the function call would look like:
        // functionToCall(element, dbConnection);
    });
```

Capture all resolved data in an array and return it with the resolved promise:

```javascript
let s = new SerializedArrayRunner(SerializedArrayRunner.ARRAY_RETURN);
s.run(arrayToIterate, classMethodToCall, class, s3, commonTag)
    .then ( (resultsArray) => {
        // Used this way, each resolved results is pushed to an array and returned.
        // Since we're calling a class method, need to pass in the class instance as scope.
        // For each element in the array the method call would look like:
        // methodToCall(element, s3, commonTag);
    )};
```


Expect array data from the given function and concatenate into an results array:

```javascript
let s = new SerializedArrayRunner(SerializedArrayRunner.CONCAT_ARRAY_RETURN);
s.run(arrayToIterate, classMethodToCall, class, s3)
    .then ( (concatenatedResultsArray) => {
        // Used this way, each resolved result array appended to the results array and returned.
        // Since we're calling a class method, need to pass in the class instance as scope.
        // For each element in the array the method call would look like:
        // methodToCall(element, s3);
        // This variation is useful for such things as AWS S3 ListObject.
    )};
```

Change the behavior of the class at any time with behaviorType setter:

```javascript
let s = new SerializedArrayRunner(); // Default behavior is LAST_RETURN
s.behaviorType = SerializedArrayRunner.ARRAY_RETURN;
```


##Description
The purpose of this class is to provide an easy mechanism for applying array data to 
promise enabled asynchronous functions (or class methods).

**Features:**
* ES6 Class
* Promise enabled
* Test coverage
* JSDoc generated API documentation
* Rest parameters are used for maximum flexibility.

##Installation
npm install serialized-array-runner --save

let SerializedArrayRunner = require('serial-array-runner');