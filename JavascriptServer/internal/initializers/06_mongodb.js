import trace from '#util/logging';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
// import * as mongoose from 'mongoose';
const { connect, connection } = mongoose;
const url = global.config.db;


export default new Promise((resolve, reject) => {
    if (!global.config.db_enabled) {
        trace('Database is disabled');
        reject('Database is disabled');
    }
    
    connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const db = connection;
    
    db.once('open', () => {
        trace('Database connected:', url);
        resolve(db);
    });
    
    db.on('error', (err) => {
        console.error('connection error:', err);
        reject(err);
    });
});
