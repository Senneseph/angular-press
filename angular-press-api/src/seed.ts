import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  // Check if admin user already exists
  const existingAdmin = await userRepository.findOne({
    where: { userLogin: 'admin' }
  });

  if (!existingAdmin) {
    console.log('Creating default admin user...');
    
    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user with password change requirement
    const admin = userRepository.create({
      userLogin: 'admin',
      userEmail: 'admin@example.com',
      userPass: hashedPassword,
      displayName: 'Administrator',
      userNicename: 'admin',
      userUrl: '',
      userStatus: 0,
      requirePasswordChange: true, // Force password change on first login
    });

    await userRepository.save(admin);
    console.log('✅ Default admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  You will be required to change this password on first login.');
  } else {
    console.log('ℹ️  Admin user already exists. Skipping creation.');
  }

  await app.close();
}

bootstrap().catch(err => {
  console.error('Error during seeding:', err);
  process.exit(1);
});

