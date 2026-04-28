import bcrypt from 'bcryptjs';
import Admin from '../models/admin.model';

export const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      
      const newAdmin = new Admin({
        email: 'admin@gmail.com',
        passwordHash,
      });
      
      await newAdmin.save();
     // console.log('✅ Default Admin seeded successfully: admin@gmail.com / admin123');
    }
  } catch (error) {
    console.error('❌ Error seeding Admin:', error);
  }
};
