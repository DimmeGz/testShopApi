'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up (queryInterface, Sequelize) {
    return [ queryInterface.addConstraint('Products', {
      fields: ['CategoryId'],
      type: 'foreign key',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onDelete: 'protect'
    })]
  },

  down (queryInterface, Sequelize) {
    return [ queryInterface.addConstraint('Products', {
      fields: ['CategoryId'],
      type: 'foreign key',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onDelete: ''
    })]
  }
}
