const redis = require("redis");
const db = redis.createClient();
class Entry {
    static getRange(from, to, cb) {
        db.lrange("entries", from, to, (err, items) => {
            if (err) return cb(err);
            let entries = [];
            items.forEach(item => {
                entries.push(JSON.parse(item));
            });
            cb(null, entries);
        });
    }
    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }
    save(cb) {
        const entryJSON = JSON.stringify(this);
        db.lpush("entries", entryJSON, err => {
            if (err) return cb(err);
            cb();
        });
    }
}
module.exports = Entry;
exports.form = (req, res) => {
    res.render("post", { title: "Post" });
};
exports.submit = (req, res, next) => {
    const data = req.body.entry;
    const user = res.locals.user;
    const username = user ? user.name : null;
    const entry = new Entry({
        username: username,
        title: data.title,
        body: data.body
    });
    entry.save(err => {
        if (err) return next(err);
        res.redirect("/");
    });
};
