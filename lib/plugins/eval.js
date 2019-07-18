module.exports = (operation, provider, scheme, helpers) => {
    const regex = /\$value\(([\_a-zA-Z][a-zA-Z0-9\.\_]*)+\)/g;
    let _ = helpers._;
    let modifiedScheme = scheme;
    let match;
    while ((match = regex.exec(scheme)) != null) {
        let path = match[1];
        if (_.has(provider, path)) {
            modifiedScheme = modifiedScheme.replace(match[0], `'${_.get(provider, path)}'`);
        } else {
            modifiedScheme = modifiedScheme.replace(match[0], undefined);
        }
    }
    try {
        const evalResult = eval(modifiedScheme);
        return evalResult;
    } catch (err) {
        return undefined;
    }
}