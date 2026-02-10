/**
 * Squared (^2) Demo Module Template
 * Use this as a starting point to create your own modules!
 * 
 * To use:
 * 1. Define your functions and constants.
 * 2. Export them in a single object (preferred) or as named exports.
 * 3. Use the 'Add Module' button in the playground to upload this file.
 * 4. In Squared, use: import demo_module.js
 */

export const demo_module = {
    hello: (name) => {
        return `Hello from the custom module, ${name}!`;
    },
    
    add: (a, b) => {
        return Number(a) + Number(b);
    },
    
    version: "1.0.0"
};

// Default export is what gets assigned to the variable in Squared
export default demo_module;