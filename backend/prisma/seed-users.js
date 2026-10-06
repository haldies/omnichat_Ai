const { PrismaClient } = require('../prisma/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Seeding businesses and users...\n');

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create demo businesses
    const businesses = [
      {
        name: 'PT Teknologi Maju',
        email: 'contact@teknologimaju.com',
        phone: '+62 21 1234 5678',
        status: 'ACTIVE',
        subscriptionPlan: 'ENTERPRISE',
        maxUsers: 50,
        maxIntegrations: 20
      },
      {
        name: 'CV Digital Solusi',
        email: 'info@digitalsolusi.com',
        phone: '+62 22 8765 4321',
        status: 'ACTIVE',
        subscriptionPlan: 'PROFESSIONAL',
        maxUsers: 20,
        maxIntegrations: 10
      },
      {
        name: 'Startup Inovasi',
        email: 'hello@startupinovasi.com',
        phone: '+62 31 5555 6666',
        status: 'TRIAL',
        subscriptionPlan: 'TRIAL',
        maxUsers: 5,
        maxIntegrations: 3
      }
    ];

    console.log('📊 Creating businesses...');
    const createdBusinesses = [];

    for (const bizData of businesses) {
      const business = await prisma.business.upsert({
        where: { id: 'temp-' + bizData.name.replace(/\s+/g, '-').toLowerCase() },
        update: {},
        create: bizData
      });
      createdBusinesses.push(business);
      console.log(`✅ Business created: ${business.name}`);
    }

    console.log('\n👥 Creating users for each business...\n');

    // Create users for first business (PT Teknologi Maju)
    const business1 = createdBusinesses[0];
    
    const admin1 = await prisma.user.upsert({
      where: { email: 'admin@teknologimaju.com' },
      update: {},
      create: {
        businessId: business1.id,
        email: 'admin@teknologimaju.com',
        password: hashedPassword,
        name: 'Admin Teknologi Maju',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log(`✅ ${business1.name} - Admin: ${admin1.email}`);

    const manager1 = await prisma.user.upsert({
      where: { email: 'manager@teknologimaju.com' },
      update: {},
      create: {
        businessId: business1.id,
        email: 'manager@teknologimaju.com',
        password: hashedPassword,
        name: 'Manager Teknologi Maju',
        role: 'MANAGER',
        status: 'ACTIVE'
      }
    });
    console.log(`✅ ${business1.name} - Manager: ${manager1.email}`);

    for (let i = 1; i <= 3; i++) {
      const agent = await prisma.user.upsert({
        where: { email: `agent${i}@teknologimaju.com` },
        update: {},
        create: {
          businessId: business1.id,
          email: `agent${i}@teknologimaju.com`,
          password: hashedPassword,
          name: `Agent ${i} - Teknologi Maju`,
          role: 'AGENT',
          status: 'ACTIVE'
        }
      });
      console.log(`✅ ${business1.name} - Agent ${i}: ${agent.email}`);
    }

    // Create users for second business (CV Digital Solusi)
    const business2 = createdBusinesses[1];
    
    const admin2 = await prisma.user.upsert({
      where: { email: 'admin@digitalsolusi.com' },
      update: {},
      create: {
        businessId: business2.id,
        email: 'admin@digitalsolusi.com',
        password: hashedPassword,
        name: 'Admin Digital Solusi',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log(`\n✅ ${business2.name} - Admin: ${admin2.email}`);

    const agent2 = await prisma.user.upsert({
      where: { email: 'agent@digitalsolusi.com' },
      update: {},
      create: {
        businessId: business2.id,
        email: 'agent@digitalsolusi.com',
        password: hashedPassword,
        name: 'Agent Digital Solusi',
        role: 'AGENT',
        status: 'ACTIVE'
      }
    });
    console.log(`✅ ${business2.name} - Agent: ${agent2.email}`);

    // Create users for third business (Startup Inovasi)
    const business3 = createdBusinesses[2];
    
    const admin3 = await prisma.user.upsert({
      where: { email: 'admin@startupinovasi.com' },
      update: {},
      create: {
        businessId: business3.id,
        email: 'admin@startupinovasi.com',
        password: hashedPassword,
        name: 'Admin Startup Inovasi',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log(`\n✅ ${business3.name} - Admin: ${admin3.email}`);

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🏢 Business 1: PT Teknologi Maju');
    console.log('   Admin: admin@teknologimaju.com / admin123');
    console.log('   Manager: manager@teknologimaju.com / admin123');
    console.log('   Agents: agent1-3@teknologimaju.com / admin123');
    
    console.log('\n🏢 Business 2: CV Digital Solusi');
    console.log('   Admin: admin@digitalsolusi.com / admin123');
    console.log('   Agent: agent@digitalsolusi.com / admin123');
    
    console.log('\n🏢 Business 3: Startup Inovasi (Trial)');
    console.log('   Admin: admin@startupinovasi.com / admin123');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Seeding completed!\n');

  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedUsers };
