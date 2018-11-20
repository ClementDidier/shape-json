module.exports = (operation, provider, scheme, helpers) => {
    let _ = helpers._;
    let result = undefined;

    for (let value of scheme) {
        let obj = _.get(provider, value);
        if (!_.isNil(obj)) {
            result = obj;
            break;
        }
    }

    return result;
}