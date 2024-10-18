module.exports = config => {
    config.addPassthroughCopy("src/css");
    config.addPassthroughCopy("src/images");
    config.addPassthroughCopy("src/js");
    config.addPassthroughCopy("languages/**/*.csv");

    config.addFilter("nodict", lang => {
        return {
            name: lang.name,
            slug: lang.slug,
            description: lang.description,
        };
    });

    return {
        dir: {
            input: 'src',
            output: 'dist'
        }
    };
};
