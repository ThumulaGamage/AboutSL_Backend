const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactPage = sequelize.define(
  'ContactPage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    
    // Header
    headerImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    headerImagePublicId: {
      type: DataTypes.STRING,
    },
    
    // Contact Information
    email: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('email');
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
    
    phone: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('phone');
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
    
    address: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('address');
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
    
    whatsapp: {
      type: DataTypes.STRING,
    },
    
    // Social Media
    facebook: {
      type: DataTypes.STRING,
    },
    instagram: {
      type: DataTypes.STRING,
    },
    twitter: {
      type: DataTypes.STRING,
    },
    
    // Business Hours
    businessHours: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('businessHours');
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
    
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Sri Lanka Standard Time (UTC +5:30)',
    },
  },
  {
    timestamps: true,
    tableName: 'contact_page',
  }
);

module.exports = ContactPage;