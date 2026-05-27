require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { ROLES, DEPARTMENTS } = require('./config/constants');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB connected');

    const departments = Object.values(DEPARTMENTS);
    
    for (const dept of departments) {
      const prefix = dept.split('_')[0];
      const email = `${prefix}@gov.in`;

      // delete the previously created ones
      await User.deleteOne({ email: `officer.test.${dept}@grievance.gov.in` });
      // delete the new ones if they already exist so we can recreate them
      await User.deleteOne({ email });

      const officerData = {
        name: `Officer ${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`,
        email: email,
        password: '1234', // Pre-save hook will hash this
        phone: `90000${Math.floor(10000 + Math.random() * 90000)}`,
        role: ROLES.OFFICER,
        department: dept,
        jurisdiction: ['Test City'],
        isActive: true,
      };

      await User.create(officerData);
      console.log(`✅ Created test officer for ${dept}: ${email} / 1234`);
    }
    
    console.log('🎉 Done creating testing officers.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  }
};

run();
