fs = require("node:fs/promises");

function parse_dict(lines) {
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return {
            word: values[0],
            pronunciation: values[1],
            pos: values[2],
            definition: values[3],
        };
    });
}

module.exports = async function () {
    const lang_names = await fs.readdir("languages");
    const languages = [];
    for (const lang of lang_names) {
        const info = await fs.open(`languages/${lang}/info.json`);
        const dict = await fs.open(`languages/${lang}/dict.csv`);
        const info_text = await info.readFile({encoding: 'utf-8'});
        const dict_text = await dict.readFile({encoding: 'utf-8'});

        const lang_obj = JSON.parse(info_text);
        lang_obj.dict = parse_dict(dict_text.split('\n'));
        languages.push(lang_obj);

        info.close();
        dict.close();
    }

    return languages;
}
