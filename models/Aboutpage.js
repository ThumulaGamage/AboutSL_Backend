const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AboutPage = sequelize.define(
  'AboutPage',
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
    
    // Stats (4 items)
    stats: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('stats');
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
    
    // Our Story
    storyTitle: {
      type: DataTypes.STRING,
      defaultValue: 'Our Story',
    },
    storyParagraph1: {
      type: DataTypes.TEXT,
    },
    storyParagraph2: {
      type: DataTypes.TEXT,
    },
    storyParagraph3: {
      type: DataTypes.TEXT,
    },
    
    // Values (4 items)
    values: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('values');
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
    
    // Team Members (3 members)
    teamMembers: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('teamMembers');
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
  },
  {
    timestamps: true,
    tableName: 'about_page',
  }
);

module.exports = AboutPage;