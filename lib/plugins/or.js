module.exports = (operation, provider, scheme, helpers) => {
    let _ = helpers._;
    let result = undefined;

    for (let value of scheme) {
        let obj = lodash.get(provider, value);
        if (!lodash.isNil(obj)) {
            result = obj;
            break;
        }
    }

    return result;
}