/**
 * Created by HODGESW on 10/12/2016.
 */

"use strict";
let assert = require('chai').assert;
let expect = require('chai').expect;
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

// If element is a zero rejects, otherwise passes the element
let rejectIfZeroIsPassed = (element) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( (el) => {
            if (el === 0) {
                return reject('Found a zero element');
            }
            else {
                return resolve(el);
            }
        },10, element);
    });
};


// Simple test to see if 2 arrays contain the exact number and values of elements
let areArraysEqual = (first, second) => {
    if (first.length !== second.length) { return false; }
    for (let i=0; i<first.length; i++) {
        if (first[i] !== second[i]) {return false;}
    }
    return true;
};


describe('SerializedArrayRunner Tests', function () {

    // Test the constructor
    describe('Class Constructor Tests', function () {

        it("constructor throws an exception if an invalid behavior type is passed", function(done) {
            assert.throw(function () {
                new SerializedArrayRunner('blah');
            }, "");
            done();
        });

        it("constructor with no arguments defaults to SerializedArrayRunner.LAST_RETURN", function(done) {
            let s = new SerializedArrayRunner();
            assert.equal(s.behaviorType, SerializedArrayRunner.LAST_RETURN);
            done();
        });

        it("constructor passed a valid argument, properly sets the type", function (done) {
            let s = new SerializedArrayRunner(SerializedArrayRunner.ARRAY_RETURN);
            assert.equal(s.behaviorType, SerializedArrayRunner.ARRAY_RETURN);
            done();
        });

    });

    describe('Run Method Resolved Data Tests', function () {

        it("Run with SerializedArrayRunner.LAST_RETURN should return last calculated value", function () {
            let s = new SerializedArrayRunner();
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2,3,4], addTwoNumbers, null, 10)
                .then ( (sum) => {
                    // Since the last number processed was 4, we should get 14
                    assert.equal(sum, 14);
                });
        });

        it("Run with SerializedArrayRunner.ARRAY_RETURN should return array of calculated values", function () {
            let s = new SerializedArrayRunner(SerializedArrayRunner.ARRAY_RETURN);
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2,3,4], addTwoNumbers, null, 10)
                .then ( (sumArray) => {
                    // Since the last number processed was 4, we should get 14
                    assert.isTrue(areArraysEqual(sumArray, [11,12,13,14]));
                });
        });

        it("Run with SerializedArrayRunner.CONCAT_ARRAY_RETURN should return concatenated array of calculated values", function () {
            let s = new SerializedArrayRunner(SerializedArrayRunner.CONCAT_ARRAY_RETURN);
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2], makeArrayFromParms, null, 10, 20)
                .then ( (sumArray) => {
                    // Since the last number processed was 4, we should get 14
                    assert.isTrue(areArraysEqual(sumArray, [1,10,20,2,10,20]));
                });
        });


        it("Execute run method multiple times with the same instance", function () {
            let s = new SerializedArrayRunner(SerializedArrayRunner.ARRAY_RETURN);
            //s.behaviorType = SerializedArrayRunner.ARRAY_RETURN;
            // Use the runner to call addTwoNumbers. Each iteration adds 10 to the
            // element in the array. Should return only the last value.
            return s.run([1,2,3,4], addTwoNumbers, null, 10)
                .then ( (sumArray) => {
                    // Since the last number processed was 4, we should get 14
                    assert.isTrue(areArraysEqual(sumArray, [11,12,13,14]));
                    s.behaviorType = SerializedArrayRunner.ARRAY_RETURN;
                    return s.run([11,12,13,14], addTwoNumbers, null, 10);
                }).then( (sumArray) => {
                    assert.isTrue(areArraysEqual(sumArray, [21, 22, 23, 24]));
                    // Set the behavior to last return and run again
                    s.behaviorType = SerializedArrayRunner.LAST_RETURN;
                    return s.run([100, 101, 102, 103], addTwoNumbers, null, 10);
                }).then( (results) => {
                    assert.equal(results, 113);
                    //done();
            });
        });

    });

    describe('Run Method Rejection Tests', function () {

        it("Any rejection from the called function should result in rejection", function () {
            return new SerializedArrayRunner().run([4,2,0,5], rejectIfZeroIsPassed, null)
                .then( () => {
                    assert.fail('resolved', 'rejected', 'Method should have returned a rejected promise');
                },
                    (err) => {
                        assert(true, 'rejected as expected');
                    }
                )
        });

        it("Returning non Array called when using array concat behavior should result in rejection", function () {
            return new SerializedArrayRunner(SerializedArrayRunner.CONCAT_ARRAY_RETURN).run([4,2,1,5], rejectIfZeroIsPassed, null)
                .then( () => {
                        assert.fail('resolved', 'rejected', 'Method should have returned a rejected promise');
                    },
                    (err) => {
                        assert(true, 'rejected as expected');
                    }
                )
        });

    });


});