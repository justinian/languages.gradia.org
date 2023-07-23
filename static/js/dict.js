import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js'

const searchOptions = {
    includeScore: true,
    threshold: 0.2,
    keys: ['word', 'pronunciation', 'definition']
}

class Dictionary {
    fuse;

    constructor(dictUrl) {
        let self = this;
        fetch(dictUrl)
            .then(r => {
                return r.json();
            }).then(list => {
                self.fuse = new Fuse(list, searchOptions);
            });
    }

    lookup(query) {
        if (!this.fuse) return;
        let results = this.fuse.search(query);
        return results.map(a => a.item);
    }
};

export function initialize(url) {
    return new Dictionary(url);
}