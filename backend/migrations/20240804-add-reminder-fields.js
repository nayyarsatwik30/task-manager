const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tasks', 'reminder_sent', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    
    await queryInterface.addColumn('tasks', 'reminder_sent_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('tasks', 'reminder_enabled', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tasks', 'reminder_sent');
    await queryInterface.removeColumn('tasks', 'reminder_sent_at');
    await queryInterface.removeColumn('tasks', 'reminder_enabled');
  }
};
