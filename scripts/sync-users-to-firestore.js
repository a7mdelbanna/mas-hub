const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mashub-a0725',
});

const auth = admin.auth();
const db = admin.firestore();

async function syncUsersToFirestore() {
  console.log('🔄 Syncing Firebase Auth users to Firestore...\n');

  try {
    // Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();

    console.log(`Found ${listUsersResult.users.length} users in Firebase Auth\n`);

    for (const user of listUsersResult.users) {
      console.log(`Processing user: ${user.email}`);

      // Get custom claims
      const customClaims = user.customClaims || {};

      // Create user document in Firestore
      const userData = {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        roles: customClaims.roles || [],
        permissions: [], // Will be populated based on roles
        portalAccess: customClaims.portalAccess || {
          admin: false,
          employee: false,
          client: [],
          candidate: false
        },
        department: customClaims.department || '',
        employeeCode: customClaims.employeeCode || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        isActive: !user.disabled,
        emailVerified: user.emailVerified,
        metadata: {
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
          updatedAt: new Date(),
          lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null
        }
      };

      // Determine permissions based on roles
      const rolePermissions = {
        super_admin: ['*'], // All permissions
        admin: [
          'users.read', 'users.write', 'users.delete',
          'projects.read', 'projects.write', 'projects.delete',
          'deals.read', 'deals.write', 'deals.delete',
          'invoices.read', 'invoices.write', 'invoices.delete',
          'reports.read', 'reports.write',
          'settings.read', 'settings.write'
        ],
        manager: [
          'users.read', 'users.write',
          'projects.read', 'projects.write',
          'deals.read', 'deals.write',
          'invoices.read',
          'reports.read'
        ],
        employee: [
          'projects.read',
          'tasks.read', 'tasks.write',
          'timesheets.read', 'timesheets.write',
          'profile.read', 'profile.write'
        ],
        hr: [
          'users.read', 'users.write',
          'candidates.read', 'candidates.write',
          'attendance.read', 'attendance.write',
          'payroll.read'
        ],
        accountant: [
          'invoices.read', 'invoices.write',
          'expenses.read', 'expenses.write',
          'reports.read', 'reports.write',
          'payroll.read', 'payroll.write'
        ],
        sales: [
          'deals.read', 'deals.write',
          'clients.read', 'clients.write',
          'quotes.read', 'quotes.write',
          'reports.read'
        ],
        client: [
          'projects.read',
          'invoices.read',
          'tickets.read', 'tickets.write'
        ],
        candidate: [
          'profile.read', 'profile.write',
          'applications.read', 'applications.write'
        ]
      };

      // Assign permissions based on roles
      let permissions = new Set();
      for (const role of userData.roles) {
        if (rolePermissions[role]) {
          rolePermissions[role].forEach(perm => permissions.add(perm));
        }
      }
      userData.permissions = Array.from(permissions);

      // Add additional fields based on role
      if (userData.roles.includes('employee') || userData.roles.includes('manager')) {
        userData.employeeDetails = {
          department: customClaims.department || 'Engineering',
          position: customClaims.position || userData.roles[0],
          employeeCode: customClaims.employeeCode || `EMP${user.uid.substring(0, 6).toUpperCase()}`,
          joiningDate: new Date('2024-01-01'),
          salary: 0, // Will be set by admin
          bankDetails: {},
          emergencyContact: {}
        };
      }

      if (userData.roles.includes('client')) {
        userData.clientDetails = {
          companyName: user.displayName || 'ACME Corporation',
          companyId: customClaims.portalAccess?.client?.[0] || 'client_001',
          contactPerson: user.displayName || 'Client Contact',
          industry: 'Technology',
          website: '',
          taxId: ''
        };
      }

      if (userData.roles.includes('candidate')) {
        userData.candidateDetails = {
          resume: '',
          skills: [],
          experience: 0,
          expectedSalary: 0,
          noticePeriod: 30,
          currentLocation: '',
          preferredLocations: [],
          applications: []
        };
      }

      // Save to Firestore
      await db.collection('users').doc(user.uid).set(userData, { merge: true });
      console.log(`✅ User document created/updated for: ${user.email}`);
    }

    console.log('\n✨ All users synced to Firestore successfully!');

    // Also create a sample company document
    console.log('\n📁 Creating sample company document...');
    await db.collection('companies').doc('client_001').set({
      id: 'client_001',
      name: 'ACME Corporation',
      code: 'ACME',
      industry: 'Technology',
      website: 'https://acme.example.com',
      email: 'info@acme.example.com',
      phone: '+1234567890',
      address: {
        street: '123 Business St',
        city: 'Tech City',
        state: 'TC',
        country: 'USA',
        postalCode: '12345'
      },
      taxId: 'TAX123456',
      registrationNumber: 'REG123456',
      status: 'active',
      clientSince: new Date('2024-01-01'),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system'
      }
    }, { merge: true });
    console.log('✅ Sample company document created');

  } catch (error) {
    console.error('❌ Error syncing users:', error.message);
    throw error;
  }
}

// Run the sync
syncUsersToFirestore()
  .then(() => {
    console.log('\n🎉 Sync complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  });