'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: function (queryInterface, Sequelize) {
    return [ queryInterface.addColumn(
        'Products',
        'CategoryId',
        Sequelize.SMALLINT
    )];
  },

  down: function (queryInterface, Sequelize) {
    return [ queryInterface.removeColumn(
        'Products',
        'CategoryId'
    )];
  }
};
