db = db.getSiblingDB('guitar-app');

db.createUser({
    user: 'sellis',
    pwd: 'sellis',
    roles: [
        { role: 'readWrite', db: 'guitar-app' }
    ]
});