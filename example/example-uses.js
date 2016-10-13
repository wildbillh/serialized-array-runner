
/*
    Example Uses for the SerializedArrayRunner Class
 */

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







