const _ = require('lodash');

module.exports = {
    name: 'foreach',
    method: (operation, provider, scheme, helpers) => {
        let parse = helpers.parse;
        if (_.has(operation, 'args[0]')) {
            let jsonpath = operation.args[0];
            let modifiedProvider = _.get(provider, jsonpath);

            let result = [];
            if (!_.isNil(modifiedProvider)) {
                for (let item of modifiedProvider) {
                    result.push(parse(item, scheme));
                }
            }

            return result;
        } else {
            return null;
        }
    }
}