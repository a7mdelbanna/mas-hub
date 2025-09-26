import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

// Sample users data
const sampleUsers = [
  {
    id: 'ahmed-admin-uid',
    email: 'ahmed@mas.com',
    name: 'Ahmed Elbanna',
    displayName: 'Ahmed Elbanna',
    phoneNumber: '+1234567890',
    title: 'Chief Executive Officer',
    position: 'CEO',
    department: 'Executive',
    departmentId: '1',
    managerId: '',
    active: true,
    roles: ['super_admin', 'admin', 'manager', 'employee'],
    permissions: ['*'],
    portalAccess: {
      employee: true,
      client: [],
      candidate: false
    }
  },
  {
    id: 'sarah-manager-uid',
    email: 'sarah@mas.com',
    name: 'Sarah Johnson',
    displayName: 'Sarah Johnson',
    phoneNumber: '+1234567891',
    title: 'Project Manager',
    position: 'Manager',
    department: 'Operations',
    departmentId: '3',
    managerId: 'ahmed-admin-uid',
    active: true,
    roles: ['manager', 'employee'],
    permissions: ['projects.*', 'tasks.*'],
    portalAccess: {
      employee: true,
      client: [],
      candidate: false
    }
  },
  {
    id: 'mike-developer-uid',
    email: 'mike@mas.com',
    name: 'Mike Wilson',
    displayName: 'Mike Wilson',
    phoneNumber: '+1234567892',
    title: 'Senior Developer',
    position: 'Developer',
    department: 'Technology',
    departmentId: '2',
    managerId: 'sarah-manager-uid',
    active: true,
    roles: ['employee'],
    permissions: ['projects.read', 'tasks.*'],
    portalAccess: {
      employee: true,
      client: [],
      candidate: false
    }
  },
  {
    id: 'john-hr-uid',
    email: 'john@mas.com',
    name: 'John Smith',
    displayName: 'John Smith',
    phoneNumber: '+1234567893',
    title: 'HR Manager',
    position: 'HR Manager',
    department: 'Human Resources',
    departmentId: '6',
    managerId: 'ahmed-admin-uid',
    active: true,
    roles: ['hr', 'manager', 'employee'],
    permissions: ['users.*', 'departments.*'],
    portalAccess: {
      employee: true,
      client: [],
      candidate: false
    }
  },
  {
    id: 'jane-employee-uid',
    email: 'jane@mas.com',
    name: 'Jane Davis',
    displayName: 'Jane Davis',
    phoneNumber: '+1234567894',
    title: 'Marketing Specialist',
    position: 'Specialist',
    department: 'Marketing',
    departmentId: '5',
    managerId: 'sarah-manager-uid',
    active: true,
    roles: ['employee'],
    permissions: ['projects.read'],
    portalAccess: {
      employee: true,
      client: [],
      candidate: false
    }
  },
  {
    id: 'bob-inactive-uid',
    email: 'bob@mas.com',
    name: 'Bob Brown',
    displayName: 'Bob Brown',
    phoneNumber: '+1234567895',
    title: 'Former Employee',
    position: 'Employee',
    department: 'Sales',
    departmentId: '4',
    managerId: 'sarah-manager-uid',
    active: false,
    roles: ['employee'],
    permissions: [],
    portalAccess: {
      employee: false,
      client: [],
      candidate: false
    }
  }
];

export async function seedUsers() {
  try {
    console.log('Starting to seed users...');

    // Check if users already exist
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    if (!snapshot.empty) {
      console.log(`Found ${snapshot.size} existing users. Skipping seed.`);
      return;
    }

    // Add each user
    for (const userData of sampleUsers) {
      const userRef = doc(db, 'users', userData.id);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Created user: ${userData.name} (${userData.email})`);
    }

    console.log('Successfully seeded all users!');
    return true;
  } catch (error) {
    console.error('Error seeding users:', error);
    return false;
  }
}

// Function to run from console
if (typeof window !== 'undefined') {
  (window as any).seedUsers = seedUsers;
}