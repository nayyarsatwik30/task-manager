const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const UserPreference = sequelize.define('UserPreference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderTime: {
    type: DataTypes.INTEGER,
    defaultValue: 30 // minutes
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_preferences',
  timestamps: true
});

module.exports = UserPreference; 