#SerializedArrayRunner
_A promise enabled, ES6 Class for serially calling asynchronous functions, to operate on array data._

[![Build Status](https://travis-ci.org/wildbillh/serialized-array-runner.svg?branch=master)](https://travis-ci.org/wildbillh/serialized-array-runner)[![Inline docs](http://inch-ci.org/github/wildbillh/serialized-array-runner.svg?branch=master)](http://inch-ci.org/github/wildbillh/serialized-array-runner)[![npm version](https://badge.fury.io/js/serialized-array-runner.svg)](https://badge.fury.io/js/serialized-array-runner)
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

**In simpler terms:** 
* I have an array of something. 
* I want to serially call an asynchronous function (returning a promise) to operate on each item in the array.
* I want a promise returned when all of the the function promises have been resolved.
* I may or may not want to capture all of the returned data from each function call. 


##Project Features
* ES6 Class
* Promise enabled
* Complete test coverage with Mocha and Chai
* JSDoc generated API documentation
* Rest parameters are used for maximum flexibility.

##Installation
npm install serialized-array-runner --save

Git Repository: https://github.com/wildbillh/serialized-array-runner

##Documentation
API Documentation: [SerializedArrayRunner.html](doc/SerializedArrayRunner.html)

##Example Usage
The code below shows typical use of the class. File [example-uses.js](example/example-uses.js)  is available in
the example folder, but is included below as a convenience. 


```javascript

// File: example-uses.js

"use strict";

let SerializedArrayRunner = require('../lib/serialized-array-runner');

// Create some simulated async calls that return promises

// This function takes 2 numbers as parameters and returns a promise of their sums.
let addTwoNumbers = (first, second) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( (adder1, adder2) => {
            return resolve(adder1 + adder2);
        },10, first, second);
    });
};


// This function takes 3 parameters and returns a promise of a 3 element array.
let makeArrayFromParms = (first, second, third) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( (p1, p2, p3) => {
            return resolve([].concat(p1, p2, p3));
        },10, first, second, third);
    });
};

let rejectIfZeroIsPassed = (element) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( (el) => {
            if (el === 0) {
                return reject('Found a zero element');
            }
            return resolve(el);
        },10, element);
    });
};


let runner = null;
let scope = null;

// The constructor sets the behavior type. Setting an invalid type will throw an exception.
// In latter sets, we won't bother with catching the exception.
try {
    runner = new SerializedArrayRunner();
}
catch (err) {
    console.log(err);
    process.exit(1);
}

// For each element in the array [1,2,3], call the addTwoNumbers function.
// For each call to the function, the first argument will be the current
// element and the second argument will be 10.
// Since we didn't set the behavior in the constructor, we get the
// default behavior (SerializedArrayRunner.LAST_RETURN)
// The run method will return a promise containing the data
// from the last call - addTwoNumbers(3,10)
// If any of the calls to the function reject, the run method rejects as well.


runner.run([1,2,3], addTwoNumbers, scope, 10)
    .then( (results) => {
        console.log(results);
        // 13

        // Now change the behavior to capture all of the results in an array
        runner.behaviorType = SerializedArrayRunner.ARRAY_RETURN;
        // And run the exact same command
        return runner.run([1,2,3], addTwoNumbers, scope, 10)
    })
    .then ( (results) => {
        console.log(results);
        // [ 11, 12, 13 ]

        // Change the behavior to concatenated array return
        runner.behaviorType = SerializedArrayRunner.CONCAT_ARRAY_RETURN;

        // Now we expect each function call to return an array and we
        // concatenate all of the results into one array.
        // Notice we're adding an additional parameter to the run call.
        // You can add as many as desired.

        return runner.run(['a','b','c'], makeArrayFromParms, scope, '1', '2');
    })
    .then( (results) => {
        console.log(results);
        // [ 'a', '1', '2', 'b', '1', '2', 'c', '1', '2' ]

        // Now we'll cause a rejection
        runner.behaviorType = SerializedArrayRunner.LAST_RETURN;
        return runner.run([4,2,0,5], rejectIfZeroIsPassed, scope);
    })
    .then ( (results) => {
        console.log(results);
        // Never executed because above rejects
    })
    .catch( (err) => {
        console.log(err);
        // 'Found a zero element'
    });

```