// userResolver.js
const db = require('./models');
// Implémentation des résolveurs GraphQL
const userResolver = {
user: ({ id }) => {
return new Promise((resolve, reject) => {
db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
if (err) {
reject(err);
} else {
resolve(row);
}
});
});
},
users: () => {
return new Promise((resolve, reject) => {
db.all(`SELECT * FROM users`, [], (err, rows) => {
if (err) {
reject(err);
} else {
resolve(rows);
}
});
});
},
addUser: ({ name, email, password }) => {
return new Promise((resolve, reject) => {
db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
[name, email, password], function(err) {
if (err) {
reject(err);
} else {
resolve({ id: this.lastID, name, email, password });
}
});
});
},
deleteUser: async ({ id }) => { // Use async/await to handle asynchronous database operations
    try {
      const user = await userResolver.user({ id }); // Get the user with the given ID
      if (!user) {
        throw new Error(`User with id ${id} not found.`);
      }
      await new Promise((resolve, reject) => { // Use a promise to handle the asynchronous database operation
        db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return user; // Return the deleted user
    } catch (err) {
      throw err;
    }
  },
  updateUser: async ({ id, name, email, password }) => { // Use async/await to handle asynchronous database operations
    try {
      const user = await userResolver.user({ id }); // Get the user with the given ID
      if (!user) {
        throw new Error(`User with id ${id} not found.`);
      }
      await new Promise((resolve, reject) => { // Use a promise to handle the asynchronous database operation
        db.run(`UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`,
          [name, email, password, id], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
      });
      return { id, name, email, password }; // Return the updated user
    } catch (err) {
      throw err;
    }
  },
};

module.exports = userResolver;