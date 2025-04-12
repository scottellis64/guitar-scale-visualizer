db.createUser(
    {
        user: "sellis",
        pwd: "sellis",
        roles: [
            {
                role: "readWrite",
                db: "guitar-app"
            }
        ]
    }
);
db.createCollection("test");