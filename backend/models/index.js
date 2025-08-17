const sequelize = require('../sequelize');
const User = require('./User');
const Task = require('./Task');
const UserPreference = require('./UserPreference');

// Define associations
Task.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Task, { foreignKey: 'user_id' });

UserPreference.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(UserPreference, { foreignKey: 'user_id' });

const syncModels = async () => {
  // Avoid auto-alter in normal runs to prevent duplicate index creation.
  // Use migrations for schema changes, or set ALTER_SYNC=true in env if you want a one-off alter.
  const doAlter = process.env.ALTER_SYNC === 'true';
  await sequelize.sync(doAlter ? { alter: true } : undefined);
};

module.exports = {
  sequelize,
  User,
  Task,
  UserPreference,
  syncModels,
}; 