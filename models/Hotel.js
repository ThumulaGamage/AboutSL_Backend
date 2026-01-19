const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hotel = sequelize.define(
  'Hotel',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    category: {
      type: DataTypes.ENUM('luxury', 'mid-range', 'budget'),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    heroImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    heroImagePublicId: {
      type: DataTypes.STRING,
    },
    photoGallery: {
      type: DataTypes.JSON,
    },
    quickSummary: {
      type: DataTypes.TEXT,
    },
    fullDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amenities: {
      type: DataTypes.JSON,
    },
    location: {
      type: DataTypes.JSON,
    },
    contact: {
      type: DataTypes.JSON,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metaDescription: {
      type: DataTypes.TEXT,
    },
    keywords: {
      type: DataTypes.JSON,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'draft'),
      defaultValue: 'draft',
    },
    publishedDate: {
      type: DataTypes.DATE,
    },
    completeness: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    location: {
      type: DataTypes.JSON,
      defaultValue: {
        region: '',
        address: '',
        coordinates: {
          lat: null,
          lng: null,
        },
      },
    },
  },
  {
    timestamps: true,
    tableName: 'hotels',
    hooks: {
      beforeSave: (hotel) => {
        if (hotel.changed('name')) {
          hotel.slug = hotel.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
      },
    },
  }
);

module.exports = Hotel;
