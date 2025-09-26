import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Firebase service account file not found!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();
const auth = admin.auth();

interface UserData {
  email: string;
  password: string;
  displayName: string;
  roles: string[];
  department?: string;
  position?: string;
  phoneNumber?: string;
  managerId?: string;
  active: boolean;
}

const testUsers: UserData[] = [
  {
    email: 'admin@mas.com',
    password: 'Admin@123456',
    displayName: 'Ahmed Elbanna',
    roles: ['super_admin', 'admin'],
    department: 'Executive',
    position: 'CEO',
    phoneNumber: '+201234567890',
    active: true
  },
  {
    email: 'hr@mas.com',
    password: 'Hr@123456',
    displayName: 'Sarah Johnson',
    roles: ['hr', 'employee'],
    department: 'Human Resources',
    position: 'HR Manager',
    phoneNumber: '+201234567891',
    active: true
  },
  {
    email: 'manager@mas.com',
    password: 'Manager@123456',
    displayName: 'Mike Chen',
    roles: ['manager', 'employee'],
    department: 'Engineering',
    position: 'Engineering Manager',
    phoneNumber: '+201234567892',
    active: true
  },
  {
    email: 'john.doe@mas.com',
    password: 'Employee@123456',
    displayName: 'John Doe',
    roles: ['employee'],
    department: 'Engineering',
    position: 'Senior Developer',
    phoneNumber: '+201234567893',
    managerId: '', // Will be set after manager is created
    active: true
  },
  {
    email: 'jane.smith@mas.com',
    password: 'Employee@123456',
    displayName: 'Jane Smith',
    roles: ['employee'],
    department: 'Marketing',
    position: 'Marketing Specialist',
    phoneNumber: '+201234567894',
    active: true
  },
  {
    email: 'bob.wilson@mas.com',
    password: 'Employee@123456',
    displayName: 'Bob Wilson',
    roles: ['employee'],
    department: 'Sales',
    position: 'Sales Representative',
    phoneNumber: '+201234567895',
    active: true
  },
  {
    email: 'alice.brown@mas.com',
    password: 'Employee@123456',
    displayName: 'Alice Brown',
    roles: ['employee'],
    department: 'Finance',
    position: 'Accountant',
    phoneNumber: '+201234567896',
    active: true
  },
  {
    email: 'charlie.davis@mas.com',
    password: 'Employee@123456',
    displayName: 'Charlie Davis',
    roles: ['employee'],
    department: 'Support',
    position: 'Customer Support Lead',
    phoneNumber: '+201234567897',
    active: true
  },
  {
    email: 'inactive@mas.com',
    password: 'Inactive@123456',
    displayName: 'Inactive User',
    roles: ['employee'],
    department: 'Operations',
    position: 'Operations Assistant',
    active: false
  },
  {
    email: 'client@external.com',
    password: 'Client@123456',
    displayName: 'External Client',
    roles: ['client'],
    position: 'Client Representative',
    active: true
  }
];

async function seedUsers() {
  console.log('🚀 Starting user seeding process...');

  let managerId: string | null = null;

  for (const userData of testUsers) {
    try {
      console.log(`Creating user: ${userData.email}`);

      // Check if user already exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(`  ✓ User ${userData.email} already exists in Auth`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create user in Firebase Auth
          userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            phoneNumber: userData.phoneNumber,
            emailVerified: true // Set as verified for testing
          });
          console.log(`  ✓ Created user ${userData.email} in Auth`);
        } else {
          throw error;
        }
      }

      // Store manager ID for later use
      if (userData.email === 'manager@mas.com') {
        managerId = userRecord.uid;
      }

      // Determine portal access based on roles
      const portalAccess: any = {
        admin: false,
        employee: false,
        client: [],
        candidate: false
      };

      if (userData.roles.includes('admin') || userData.roles.includes('super_admin')) {
        portalAccess.admin = true;
        portalAccess.employee = true;
      } else if (userData.roles.includes('hr') || userData.roles.includes('manager')) {
        portalAccess.employee = true;
      } else if (userData.roles.includes('employee')) {
        portalAccess.employee = true;
      } else if (userData.roles.includes('client')) {
        portalAccess.client = [userRecord.uid];
      }

      // Set custom claims
      await auth.setCustomUserClaims(userRecord.uid, {
        roles: userData.roles,
        portalAccess
      });

      // Create/Update user profile in Firestore
      const userProfile = {
        email: userData.email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber || null,
        roles: userData.roles,
        permissions: [],
        portalAccess,
        department: userData.department || null,
        position: userData.position || null,
        managerId: userData.managerId || managerId || null,
        active: userData.active,
        language: 'en',
        onboardingCompleted: true,
        emailVerified: true,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: userRecord.uid,
        updatedBy: userRecord.uid
      };

      // If this is John Doe and we have a manager ID, set it
      if (userData.email === 'john.doe@mas.com' && managerId) {
        userProfile.managerId = managerId;
      }

      await db.collection('users').doc(userRecord.uid).set(userProfile, { merge: true });
      console.log(`  ✓ Created/Updated user profile in Firestore`);

    } catch (error: any) {
      console.error(`  ✗ Failed to create user ${userData.email}:`, error.message);
    }
  }

  console.log('✅ User seeding completed!');
  console.log('\nYou can now log in with these test accounts:');
  console.log('------------------------------------------------');
  console.log('Admin:    admin@mas.com / Admin@123456');
  console.log('HR:       hr@mas.com / Hr@123456');
  console.log('Manager:  manager@mas.com / Manager@123456');
  console.log('Employee: john.doe@mas.com / Employee@123456');
  console.log('Client:   client@external.com / Client@123456');
  console.log('------------------------------------------------');
}

// Run the seed function
seedUsers()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });