const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    itemType: {
      type: DataTypes.ENUM('Destination', 'Hotel', 'Restaurant'),
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userEmail: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photos: {
      type: DataTypes.JSON,
    },
    helpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    moderatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    tableName: 'reviews',
  }
);

module.exports = Review;
