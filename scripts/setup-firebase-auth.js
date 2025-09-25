const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mashub-a0725',
});

const auth = admin.auth();

async function setupAuth() {
  console.log('Setting up Firebase Authentication...');

  // Test users to create
  const testUsers = [
    {
      email: 'admin@mashub.com',
      password: 'Admin@123456',
      displayName: 'System Admin',
      emailVerified: true,
      customClaims: {
        roles: ['admin', 'super_admin'],
        portalAccess: {
          admin: true,
          employee: true,
          client: [],
          candidate: false
        }
      }
    },
    {
      email: 'manager@mashub.com',
      password: 'Manager@123456',
      displayName: 'John Manager',
      emailVerified: true,
      customClaims: {
        roles: ['manager', 'employee'],
        portalAccess: {
          admin: false,
          employee: true,
          client: [],
          candidate: false
        }
      }
    },
    {
      email: 'employee@mashub.com',
      password: 'Employee@123456',
      displayName: 'Jane Employee',
      emailVerified: true,
      customClaims: {
        roles: ['employee'],
        portalAccess: {
          admin: false,
          employee: true,
          client: [],
          candidate: false
        }
      }
    },
    {
      email: 'client@mashub.com',
      password: 'Client@123456',
      displayName: 'ACME Corporation',
      emailVerified: true,
      customClaims: {
        roles: ['client'],
        portalAccess: {
          admin: false,
          employee: false,
          client: ['client_001'],
          candidate: false
        }
      }
    },
    {
      email: 'candidate@mashub.com',
      password: 'Candidate@123456',
      displayName: 'Bob Candidate',
      emailVerified: true,
      customClaims: {
        roles: ['candidate'],
        portalAccess: {
          admin: false,
          employee: false,
          client: [],
          candidate: true
        }
      }
    }
  ];

  // Create users
  for (const userData of testUsers) {
    try {
      // Check if user exists
      let user;
      try {
        user = await auth.getUserByEmail(userData.email);
        console.log(`User ${userData.email} already exists, updating...`);

        // Update existing user
        await auth.updateUser(user.uid, {
          displayName: userData.displayName,
          emailVerified: userData.emailVerified,
          password: userData.password
        });
      } catch (error) {
        // User doesn't exist, create new
        console.log(`Creating user: ${userData.email}`);
        user = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: userData.emailVerified
        });
      }

      // Set custom claims
      await auth.setCustomUserClaims(user.uid, userData.customClaims);
      console.log(`✓ Set up user: ${userData.email} with roles: ${userData.customClaims.roles.join(', ')}`);

    } catch (error) {
      console.error(`Error setting up user ${userData.email}:`, error.message);
    }
  }

  console.log('\n✅ Firebase Authentication setup complete!');
  console.log('\n📝 Test Credentials:');
  console.log('=====================================');
  testUsers.forEach(user => {
    console.log(`${user.displayName}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Roles: ${user.customClaims.roles.join(', ')}`);
    console.log('-------------------------------------');
  });
}

setupAuth()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });