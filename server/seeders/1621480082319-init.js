'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('rooms', [
      {
        id: 1,
        name: '테스트 방',
        userLimit: 4,
        origin: '출발지',
        destination: '도착지',
        startAt: new Date(),
        gender: 'male',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert('roomChats', [
      {
        id: 1,
        name: '일반',
        private: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        WorkspaceId: 1,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
