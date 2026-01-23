const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Destination = sequelize.define(
  'Destination',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Basic Info
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('beach', 'nature', 'cultural', 'wildlife'),
      allowNull: false,
    },

    // Hero Image (Main Image)
    heroImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    heroImagePublicId: {
      type: DataTypes.STRING,
    },

    // SECTION 1: Overview
    overview: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('overview');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', images: [] };
          }
        }
        return rawValue || { description: '', images: [] };
      }
    },

    // SECTION 2: What to See
    whatToSee: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        highlights: [],
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('whatToSee');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', highlights: [], images: [] };
          }
        }
        return rawValue || { description: '', highlights: [], images: [] };
      }
    },

    // SECTION 3: Best Time to Visit
    bestTimeToVisit: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        season: '',
        months: '',
        weatherInfo: '',
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('bestTimeToVisit');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', season: '', months: '', weatherInfo: '', images: [] };
          }
        }
        return rawValue || { description: '', season: '', months: '', weatherInfo: '', images: [] };
      }
    },

    // SECTION 4: Things to Do
    thingsToDo: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        activities: [],
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('thingsToDo');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', activities: [], images: [] };
          }
        }
        return rawValue || { description: '', activities: [], images: [] };
      }
    },

    // SECTION 5: Travel Tips
    travelTips: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        tips: [],
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('travelTips');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', tips: [], images: [] };
          }
        }
        return rawValue || { description: '', tips: [], images: [] };
      }
    },

    // SECTION 6: History & Legend
    historyAndLegend: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        historicalFacts: '',
        legends: '',
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('historyAndLegend');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', historicalFacts: '', legends: '', images: [] };
          }
        }
        return rawValue || { description: '', historicalFacts: '', legends: '', images: [] };
      }
    },

    // Location for auto-linking hotels/restaurants
    location: {
      type: DataTypes.JSON,
      defaultValue: {
        coordinates: {
          lat: 7.8731,
          lng: 80.7718,
        },
        nearbyCity: '',
        region: '',
      },
      get() {
        const rawValue = this.getDataValue('location');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { coordinates: { lat: 7.8731, lng: 80.7718 }, nearbyCity: '', region: '' };
          }
        }
        return rawValue || { coordinates: { lat: 7.8731, lng: 80.7718 }, nearbyCity: '', region: '' };
      }
    },

    // SEO
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

    // Status
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
    tableName: 'destinations',
    hooks: {
      beforeSave: (destination) => {
        // Auto-generate slug from name
        if (destination.changed('name')) {
          destination.slug = destination.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // Set published date when activating
        if (destination.changed('status') && destination.status === 'active' && !destination.publishedDate) {
          destination.publishedDate = new Date();
        }

        // Sync location.region with main region
        if (destination.changed('region')) {
          const location = destination.location || { coordinates: { lat: 7.8731, lng: 80.7718 }, nearbyCity: '', region: '' };
          location.region = destination.region;
          destination.location = location;
        }
      },
    },
  }
);

module.exports = Destination;