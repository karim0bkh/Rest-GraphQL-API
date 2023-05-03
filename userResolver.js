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
  updateUser: async ({ id, name, email, password }) => {
    try {
      const user = await userResolver.user({ id });
      if (!user) {
        throw new Error(`User with id ${id} not found.`);
      }
      const fieldsToUpdate = {};
      if (name) {
        fieldsToUpdate.name = name;
      }
      if (email) {
        fieldsToUpdate.email = email;
      }
      if (password) {
        fieldsToUpdate.password = password;
      }
      const fieldKeys = Object.keys(fieldsToUpdate);
      if (fieldKeys.length === 0) {
        throw new Error('At least one field must be provided to update.');
      }
      const placeholders = fieldKeys.map((key) => `${key} = ?`).join(', ');
      const fieldValues = fieldKeys.map((key) => fieldsToUpdate[key]);
      fieldValues.push(id);
      await new Promise((resolve, reject) => {
        const sql = `UPDATE users SET ${placeholders} WHERE id = ?`;
        console.log(sql);
        console.log(fieldValues);
        db.run(sql, fieldValues, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      const updatedUser = { id, ...fieldsToUpdate };
      return updatedUser;
    } catch (err) {
      throw err;
    }
  },
    };

module.exports = userResolver;