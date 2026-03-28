const sequelize = require('../sequelize');
const User = require('./User');
const Task = require('./Task');
const UserPreference = require('./UserPreference');

// ====================
// 🔗 DEFINE RELATIONS
// ====================
Task.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Task, { foreignKey: 'user_id' });

UserPreference.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(UserPreference, { foreignKey: 'user_id' });

// ====================
// 🚀 SYNC FUNCTION
// ====================
const syncModels = async () => {
  try {
    // ✅ STEP 1: CONNECT DB
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // ✅ STEP 2: SYNC TABLES
    const doAlter = process.env.ALTER_SYNC === 'true';

    await sequelize.sync({
      alter: doAlter,   // only if explicitly enabled
      force: false      // NEVER true in production
    });

    console.log('✅ All models synced successfully');

  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Task,
  UserPreference,
  syncModels,
};