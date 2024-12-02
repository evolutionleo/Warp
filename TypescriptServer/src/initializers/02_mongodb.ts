import trace from '#util/logging';
import mongoose from 'mongoose';

const { connect, connection } = mongoose;

const uri = global.config.db.path + global.config.db.name;

mongoose.set('strictQuery', false);

var _export;

if (global.config.db_enabled) {
    connect(uri, {});

    const db = connection;

    _export = new Promise((resolve, reject) => {
        db.once('open', () => {
            trace('Database connected:', uri);
            resolve(db);
        })
        
        db.on('error', (err) => {
            console.error('connection error:', err);
            reject(err);
        })
    })
}
else {
    trace('Database is disabled');
    _export = null;
}

export default _export;