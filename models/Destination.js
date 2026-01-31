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

    // SECTION 2: History & Legend
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

    // SECTION 3: Where is Located (NEW - replaces old location field)
    whereIsLocated: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        city: '',
        coordinates: {
          lat: 7.8731,
          lng: 80.7718,
        },
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('whereIsLocated');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', city: '', coordinates: { lat: 7.8731, lng: 80.7718 }, images: [] };
          }
        }
        return rawValue || { description: '', city: '', coordinates: { lat: 7.8731, lng: 80.7718 }, images: [] };
      }
    },

    // SECTION 4: How to Go (NEW - multiple transport methods)
    howToGo: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        methods: [
          // Example: { type: 'car', description: 'Drive via A1 highway', duration: '3 hours', distance: '150 km' }
          // Example: { type: 'bus', description: 'Take bus #45 from Colombo', duration: '4 hours', fare: 'LKR 500' }
          // Example: { type: 'train', description: 'Southern line train', duration: '5 hours', fare: 'LKR 300' }
          // Example: { type: 'flight', description: 'Domestic flight available', duration: '45 minutes', fare: '$50' }
        ],
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('howToGo');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', methods: [], images: [] };
          }
        }
        return rawValue || { description: '', methods: [], images: [] };
      }
    },

    // SECTION 5: What to See
    whatToSee: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        highlights: [
          // Example: { title: 'Lion\'s Gate', description: 'Ancient entrance...', image: 'url' }
        ],
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

    // SECTION 6: Best Time to Visit
    bestTimeToVisit: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        seasons: [
          // Example: 
          // {
          //   name: 'Dry Season',
          //   months: 'January to April',
          //   weather: 'Sunny and warm, 25-30°C',
          //   pros: ['Clear skies', 'Perfect for climbing'],
          //   cons: ['More crowded', 'Higher prices'],
          //   recommended: true
          // }
        ],
        images: [],
      },
      get() {
        const rawValue = this.getDataValue('bestTimeToVisit');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', seasons: [], images: [] };
          }
        }
        return rawValue || { description: '', seasons: [], images: [] };
      }
    },

    // SECTION 7: Things to Do
    thingsToDo: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        activities: [
          // Example: { title: 'Rock Climbing', description: 'Climb 1,200 steps...', image: 'url' }
        ],
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

    // SECTION 8: Where to Stay (NEW - selected hotels)
    whereToStay: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        hotels: [
          // Example: { hotelId: 1, distance: 2.5, unit: 'km' }
        ],
      },
      get() {
        const rawValue = this.getDataValue('whereToStay');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', hotels: [] };
          }
        }
        return rawValue || { description: '', hotels: [] };
      }
    },

    // SECTION 9: Where to Eat (NEW - selected restaurants)
    whereToEat: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        restaurants: [
          // Example: { restaurantId: 1, distance: 1.2, unit: 'km' }
        ],
      },
      get() {
        const rawValue = this.getDataValue('whereToEat');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', restaurants: [] };
          }
        }
        return rawValue || { description: '', restaurants: [] };
      }
    },

    // SECTION 10: Travel Tips
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

    // SECTION 11: Nearby Destinations (NEW)
    nearbyDestinations: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        destinations: [
          // Example: { destinationId: 2, distance: 15, unit: 'km' }
        ],
      },
      get() {
        const rawValue = this.getDataValue('nearbyDestinations');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return { description: '', destinations: [] };
          }
        }
        return rawValue || { description: '', destinations: [] };
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

        // Sync whereIsLocated region with main region
        if (destination.changed('region')) {
          const whereIsLocated = destination.whereIsLocated || { 
            description: '', 
            city: '', 
            coordinates: { lat: 7.8731, lng: 80.7718 }, 
            images: [] 
          };
          // You can add region sync logic here if needed
          destination.whereIsLocated = whereIsLocated;
        }
      },
    },
  }
);

module.exports = Destination;