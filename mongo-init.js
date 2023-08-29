/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
db.createUser({
  user: process.env.MONGO_DATABASE_USERNAME,
  pwd: process.env.MONGO_DATABASE_PASSWORD,
  roles: [{ role: "readWrite", db: "web-chat" }],
});
