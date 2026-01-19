const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,

    dialectOptions: {
      connectTimeout: 60000,
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected Successfully');
    console.log('📍 Host:', process.env.DB_HOST);
    console.log('📊 Database:', process.env.DB_NAME);

    // Create tables automatically
    await sequelize.sync({ alter: false });
    console.log('✅ Database Tables Created');
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
