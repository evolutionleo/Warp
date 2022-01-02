import trace from '#util/logging';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
// import * as mongoose from 'mongoose';
const { connect, connection } = mongoose;
const url = global.config.db;

var _export;

if (global.config.db_enabled) {
    connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
    
    const db = connection;
    
    _export = new Promise((resolve, reject) => {
        db.once('open', () => {
            trace('Database connected:', url);
            resolve(db);
        });
        
        db.on('error', (err) => {
            console.error('connection error:', err);
            reject(err);
        });
    });
}
else {
    trace('Database is disabled');
    _export = null;
}

export default _export;
