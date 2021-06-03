const mongoose = require('mongoose');
const url = config.db;

if (config.db_enabled) {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

    const db = mongoose.connection;

    module.exports = new Promise((resolve, reject) => {
        db.once('open', () => {
            console.log('Database connected:', url);
            resolve(db);
        })
        
        db.on('error', (err) => {
            console.error('connection error:', err);
            reject(err);
        })
    })
}
else {
    console.log('Database is disabled');
    module.exports = null;
}