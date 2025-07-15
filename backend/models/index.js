const sequelize = require('../sequelize');
const User = require('./User');
const Task = require('./Task');

// You can define associations here if needed in the future
// Example: Task.belongsTo(User);

const syncModels = async () => {
  await sequelize.sync({ alter: true }); // { alter: true } for dev, { force: true } to drop and recreate
};

module.exports = {
  sequelize,
  User,
  Task,
  syncModels,
}; 