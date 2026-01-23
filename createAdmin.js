const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const Admin = require('./models/Admin');

async function createFirstAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Create tables if they don't exist
    await sequelize.sync({ alter: false });
    console.log('✅ Tables synchronized');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: 'admin@aboutsl.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email: admin@aboutsl.com');
      process.exit(0);
    }

    // Create first admin
    const admin = await Admin.create({
      email: 'admin@aboutsl.com',
      password: 'Admin@123',  // Will be hashed automatically by model hook
      name: 'Super Admin',
      role: 'super-admin',
      isActive: true
    });

    console.log('✅ First admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin@123');
    console.log('👤 Name:', admin.name);
    console.log('🎭 Role:', admin.role);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the script
createFirstAdmin();
