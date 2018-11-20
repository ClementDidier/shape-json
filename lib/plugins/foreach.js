module.exports = (operation, provider, scheme, helpers) => {
    let parse = helpers.parse;
    let _ = helpers._;

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