const _ = require('lodash');

module.exports = {
    name: 'if',
    method: (operation, provider, scheme, helpers) => {
        let condition = operation.args[0];
        let result = evalInContext(condition, provider);
        return result ? helpers.parse(provider, scheme) : undefined;
    },
    parameters: {
        "argsValidation": false 
    }
}

function evalInContext(scr, context)
{
    return eval("Object.assign(this," + JSON.stringify(context) + "); " + scr);
}