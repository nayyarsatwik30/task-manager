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
  await sequelize.sync({ alter: true }); // { alter: true } for dev, { force: true } to drop and recreate
};

module.exports = {
  sequelize,
  User,
  Task,
  UserPreference,
  syncModels,
}; 