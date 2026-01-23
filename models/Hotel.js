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
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('photoGallery');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return [];
          }
        }
        return rawValue || [];
      }
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
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('amenities');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return [];
          }
        }
        return rawValue || [];
      }
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
      get() {
        const rawValue = this.getDataValue('location');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { region: '', address: '', coordinates: { lat: null, lng: null } };
          }
        }
        return rawValue || { region: '', address: '', coordinates: { lat: null, lng: null } };
      }
    },
    contact: {
      type: DataTypes.JSON,
      defaultValue: {},
      get() {
        const rawValue = this.getDataValue('contact');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return {};
          }
        }
        return rawValue || {};
      }
    },
    nearbyDestinations: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('nearbyDestinations');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return [];
          }
        }
        return rawValue || [];
      }
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
      get() {
        const rawValue = this.getDataValue('keywords');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return [];
          }
        }
        return rawValue || [];
      }
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

        if (hotel.changed('status') && hotel.status === 'active' && !hotel.publishedDate) {
          hotel.publishedDate = new Date();
        }
      },
    },
  }
);

module.exports = Hotel;