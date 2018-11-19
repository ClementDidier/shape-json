module.exports = (operation, provider, scheme, helpers) => {
    let result = undefined;
    if (operation.args.length > 0) {
        result = [];
        for (let arg of operation.args) {
            if (_.has(provider, arg)) {
                let array = _.get(provider, arg);
                for (let item of array) {
                    result.push(helpers.parse(item, scheme));
                }
            }
        }
    }
    return result;
}