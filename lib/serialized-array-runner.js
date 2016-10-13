

"use strict";

/**
 * @file
 * @author Bill Hodges
 */

/**
 * Class for serially executing functions returning promises, with each call
 * passing an element of the array as an argument.
 */
class SerializedArrayRunner {

    /**
     * Create the class and optionaly set the behavior.
     * See <a href="#BehaviorsLink">Behaviors</a> for a list of allowed types.
     * @throws will throw an error if an invalid returnBehavior parameter is passed
     * @param {string} [returnBehavior]  Optional parameter to set the return behavior.
     * The default value is SerializedArrayRunner.LAST_RETURN.
     * @constructor
     *
     */
    constructor (returnBehavior = SerializedArrayRunner.LAST_RETURN) {
        this.behaviorType = returnBehavior;
    }

    // ------------------------------------------------------------------------------
    /**
     *Retrieve the value of the current return behavior
     * @returns {string}
     */
    get behaviorType () {
        return this.returnBehavior;
    }

    // -------------------------------------------------------------------------------


    /**
     * @throws will throw an error if an invalid returnBehavior parameter is passed
     */

    /**
     *  <div id="BehaviorsLink"/>
     *  Set a new runner return behavior. The three types allowed are:
     *  <h5>Behaviors:</h5>
     *  <table>
     *  <thead><tr><th>Behavior Type</th><th>Description</th></tr></thead>
     *  <tr><td>SerializedArrayRunner.LAST_RETURN</td> <td>All but the last resolved data is discarded.</td></tr>
     *  <tr><td>SerializedArrayRunner.ARRAY_RETURN</td> <td>Each resolved data returned is pushed to an array and returned</td></tr>
     *  <tr><td>SerializedArrayRunner.CONCAT_ARRAY_RETURN</td> <td>The resolved data is an array it's contents are concatenated to the
     *  final array for each iteration.</td</tr>
     *  </table>
     *
     * @param {string} returnType
     */


    set behaviorType (returnType) {
        if (!SerializedArrayRunner.VALID_RETURN_BEHAVIOR_TYPES.includes(returnType)) {
            throw new Error('Invalid Return Behavior. Use one of the defined types');
        }
        this.returnBehavior = returnType;
        switch (this.returnBehavior) {
            case SerializedArrayRunner.LAST_RETURN:
                this.is_last_return = true;
                this.is_array_return = false;
                this.is_concat_array_return = false;
                break;
            case SerializedArrayRunner.ARRAY_RETURN:
                this.is_last_return = false;
                this.is_array_return = true;
                this.is_concat_array_return = false;
                break;
            case SerializedArrayRunner.CONCAT_ARRAY_RETURN:
                this.is_last_return = false;
                this.is_array_return = false;
                this.is_concat_array_return = true;
                break;
        }
    }

    // ------------------------------------------------------------------------------
    /**
     * Iterates through the array calling the provided function and waits for the
     * resolution before proceeding. Returns a promise when the iteration is complete.
     * The data resolved depends on the supplied function return data and the configured
     * return behavior
     * @param {Array} arrayToIterate The array who's elements are passed to the function.
     * @param {function} functionToCall The function that gets call. It must return a promise.
     * The first parameter is the current array element.
     * @param {object} scope The scope for the function to be called in. Necessary if the
     * function is class method.
     * @param {...*} args Zero or more arguments to send to the function. Note that
     * the first argument here, is the fourth argument to the called function.
     * @returns {Promise} A resolved promise is returned if all function calls resolve.
     */
    run (arrayToIterate, functionToCall, scope, ...args) {
        return new Promise ( (resolve, reject) => {
            // If we accumulate results (based on the type behavior, this array stores it.
            let resultsArray = [];

            arrayToIterate.reduce(
                (cur, next) => {
                    return cur.then((results) => {
                        // In the first iteration, data is resolve, check for this
                        if (results) {
                            // Do different types of accumulation (or none) based on the desired behavior
                            if (this.is_array_return) {
                                resultsArray.push(results);
                            }
                            else if (this.is_concat_array_return) {
                                if (Array.isArray(results)) {
                                    resultsArray = resultsArray.concat(results);
                                }
                                else {
                                    return reject(`Expected Array, but found type ${typeof results} instead`);
                                }
                            }
                        }
                        return functionToCall.call(scope, next, ...args);
                    });
                },
                Promise.resolve() // initial value
            ).then((results) => {
                // This is our ultimate return, add the results to the array (if needed) and return them.
                if (this.is_array_return) {
                    resultsArray.push(results);
                    resolve(resultsArray);
                }
                else if (this.is_concat_array_return) {
                    if (Array.isArray(results)) {
                        resultsArray = resultsArray.concat(results);
                        resolve(resultsArray);
                    }
                    else {
                        return reject(`Expected Array, but found type ${typeof results} instead`);
                    }
                }
                else {
                    resolve(results);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }


    /**
     * Used to set the behavior to last return. The data from resolved promises for all
     * but the last call will be discarded.
     * @returns {string}
     */
    static get LAST_RETURN() {
        return 'LAST_RETURN';
    }

    /**
     * Used to set the behavior to array return. The data from resolved promises for all
     * will be pushed into an array and returned with the resolved promise.
     * @return {string}
     */
    static get ARRAY_RETURN() {
        return 'ARRAY_RETURN';
    }

    /**
     * Used to set the behavior to concatenated array return. The data from resolved promises for is
     * expected to be an array. Each array returned is concatenated and returned with the resolved promise.
     * @return {string}
     */
    static get CONCAT_ARRAY_RETURN() {
        return 'CONCAT_ARRAY_RETURN';
    }

    /**
     * Generates an array of valid return types. Used internally for validation of passed parameters.
     * @returns {Array<string>}
     * @private
     */
    static get VALID_RETURN_BEHAVIOR_TYPES () {
        return [
            SerializedArrayRunner.LAST_RETURN,
            SerializedArrayRunner.ARRAY_RETURN,
            SerializedArrayRunner.CONCAT_ARRAY_RETURN
        ];
    }

}

module.exports = SerializedArrayRunner;