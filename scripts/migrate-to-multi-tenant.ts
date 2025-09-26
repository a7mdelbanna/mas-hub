#!/usr/bin/env node

/**
 * Migration Script: Convert single-tenant data to multi-tenant architecture
 *
 * CRITICAL: This script adds organizationId to all existing data
 * Run this AFTER deploying the new code but BEFORE users access the system
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found at:', serviceAccountPath);
  console.error('Please ensure firebase-service-account.json exists');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const db = admin.firestore();
const auth = admin.auth();

interface MigrationStats {
  organizations: { created: number; existing: number };
  users: { migrated: number; failed: number };
  projects: { migrated: number; failed: number };
  tasks: { migrated: number; failed: number };
  invoices: { migrated: number; failed: number };
  tickets: { migrated: number; failed: number };
  errors: string[];
}

const stats: MigrationStats = {
  organizations: { created: 0, existing: 0 },
  users: { migrated: 0, failed: 0 },
  projects: { migrated: 0, failed: 0 },
  tasks: { migrated: 0, failed: 0 },
  invoices: { migrated: 0, failed: 0 },
  tickets: { migrated: 0, failed: 0 },
  errors: [],
};

/**
 * Step 1: Create default organization for existing data
 */
async function createDefaultOrganization(): Promise<string> {
  console.log('\n📦 Step 1: Creating default organization...');

  // Check if default organization already exists
  const existingOrgs = await db
    .collection('organizations')
    .where('slug', '==', 'default-org')
    .limit(1)
    .get();

  if (!existingOrgs.empty) {
    const orgId = existingOrgs.docs[0].id;
    console.log(`✅ Default organization already exists: ${orgId}`);
    stats.organizations.existing++;
    return orgId;
  }

  // Create new default organization
  const orgData = {
    name: 'MAS Business',
    slug: 'default-org',
    description: 'Default organization for migrated data',
    settings: {
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
    },
    limits: {
      maxUsers: -1,
      maxProjects: -1,
      maxStorage: -1,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    active: true,
  };

  const orgRef = await db.collection('organizations').add(orgData);
  console.log(`✅ Created default organization: ${orgRef.id}`);
  stats.organizations.created++;
  return orgRef.id;
}

/**
 * Step 2: Migrate users to include organization membership
 */
async function migrateUsers(organizationId: string): Promise<void> {
  console.log('\n👥 Step 2: Migrating users...');

  const usersSnapshot = await db.collection('users').get();
  console.log(`Found ${usersSnapshot.size} users to migrate`);

  const batch = db.batch();
  let batchCount = 0;

  for (const userDoc of usersSnapshot.docs) {
    try {
      const userData = userDoc.data();

      // Check if user already has organization data
      if (userData.organizations && userData.organizations[organizationId]) {
        console.log(`⏭️  User ${userData.email} already migrated`);
        continue;
      }

      // Add organization membership
      const updates: any = {
        organizations: {
          [organizationId]: {
            roles: userData.roles || ['employee'],
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            active: true,
          },
        },
        currentOrganizationId: organizationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.update(userDoc.ref, updates);

      // Create user-organization relationship
      const userOrgRef = db.doc(`userOrganizations/${userDoc.id}_${organizationId}`);
      batch.set(userOrgRef, {
        userId: userDoc.id,
        organizationId,
        roles: userData.roles || ['employee'],
        department: userData.department || '',
        position: userData.position || userData.title || '',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
      });

      batchCount++;
      stats.users.migrated++;

      // Commit batch every 500 operations (Firestore limit)
      if (batchCount >= 250) {
        await batch.commit();
        console.log(`  Committed batch of ${batchCount} user updates`);
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Failed to migrate user ${userDoc.id}:`, error);
      stats.users.failed++;
      stats.errors.push(`User ${userDoc.id}: ${error}`);
    }
  }

  // Commit remaining batch
  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Committed final batch of ${batchCount} user updates`);
  }

  console.log(`✅ Migrated ${stats.users.migrated} users`);
  if (stats.users.failed > 0) {
    console.log(`⚠️  Failed to migrate ${stats.users.failed} users`);
  }
}

/**
 * Step 3: Add organizationId to all projects
 */
async function migrateProjects(organizationId: string): Promise<void> {
  console.log('\n📋 Step 3: Migrating projects...');

  const projectsSnapshot = await db.collection('projects').get();
  console.log(`Found ${projectsSnapshot.size} projects to migrate`);

  const batch = db.batch();
  let batchCount = 0;

  for (const projectDoc of projectsSnapshot.docs) {
    try {
      const projectData = projectDoc.data();

      // Check if already has organizationId
      if (projectData.organizationId) {
        console.log(`⏭️  Project ${projectData.name} already migrated`);
        continue;
      }

      batch.update(projectDoc.ref, {
        organizationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      batchCount++;
      stats.projects.migrated++;

      if (batchCount >= 500) {
        await batch.commit();
        console.log(`  Committed batch of ${batchCount} project updates`);
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Failed to migrate project ${projectDoc.id}:`, error);
      stats.projects.failed++;
      stats.errors.push(`Project ${projectDoc.id}: ${error}`);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Committed final batch of ${batchCount} project updates`);
  }

  console.log(`✅ Migrated ${stats.projects.migrated} projects`);
}

/**
 * Step 4: Add organizationId to all tasks
 */
async function migrateTasks(organizationId: string): Promise<void> {
  console.log('\n✅ Step 4: Migrating tasks...');

  const tasksSnapshot = await db.collection('tasks').get();
  console.log(`Found ${tasksSnapshot.size} tasks to migrate`);

  const batch = db.batch();
  let batchCount = 0;

  for (const taskDoc of tasksSnapshot.docs) {
    try {
      const taskData = taskDoc.data();

      if (taskData.organizationId) {
        continue;
      }

      batch.update(taskDoc.ref, {
        organizationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      batchCount++;
      stats.tasks.migrated++;

      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Failed to migrate task ${taskDoc.id}:`, error);
      stats.tasks.failed++;
      stats.errors.push(`Task ${taskDoc.id}: ${error}`);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Migrated ${stats.tasks.migrated} tasks`);
}

/**
 * Step 5: Add organizationId to all invoices
 */
async function migrateInvoices(organizationId: string): Promise<void> {
  console.log('\n💰 Step 5: Migrating invoices...');

  const invoicesSnapshot = await db.collection('invoices').get();
  console.log(`Found ${invoicesSnapshot.size} invoices to migrate`);

  const batch = db.batch();
  let batchCount = 0;

  for (const invoiceDoc of invoicesSnapshot.docs) {
    try {
      const invoiceData = invoiceDoc.data();

      if (invoiceData.organizationId) {
        continue;
      }

      batch.update(invoiceDoc.ref, {
        organizationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      batchCount++;
      stats.invoices.migrated++;

      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Failed to migrate invoice ${invoiceDoc.id}:`, error);
      stats.invoices.failed++;
      stats.errors.push(`Invoice ${invoiceDoc.id}: ${error}`);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Migrated ${stats.invoices.migrated} invoices`);
}

/**
 * Step 6: Add organizationId to all tickets
 */
async function migrateTickets(organizationId: string): Promise<void> {
  console.log('\n🎫 Step 6: Migrating tickets...');

  const ticketsSnapshot = await db.collection('tickets').get();
  console.log(`Found ${ticketsSnapshot.size} tickets to migrate`);

  const batch = db.batch();
  let batchCount = 0;

  for (const ticketDoc of ticketsSnapshot.docs) {
    try {
      const ticketData = ticketDoc.data();

      if (ticketData.organizationId) {
        continue;
      }

      batch.update(ticketDoc.ref, {
        organizationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      batchCount++;
      stats.tickets.migrated++;

      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    } catch (error) {
      console.error(`❌ Failed to migrate ticket ${ticketDoc.id}:`, error);
      stats.tickets.failed++;
      stats.errors.push(`Ticket ${ticketDoc.id}: ${error}`);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Migrated ${stats.tickets.migrated} tickets`);
}

/**
 * Step 7: Update Auth custom claims
 */
async function updateAuthClaims(organizationId: string): Promise<void> {
  console.log('\n🔐 Step 7: Updating authentication custom claims...');

  try {
    const listUsersResult = await auth.listUsers();

    for (const userRecord of listUsersResult.users) {
      try {
        // Get user's Firestore document
        const userDoc = await db.collection('users').doc(userRecord.uid).get();

        if (!userDoc.exists) {
          console.log(`⚠️  No Firestore document for auth user ${userRecord.email}`);
          continue;
        }

        const userData = userDoc.data();
        const userOrgData = userData?.organizations?.[organizationId];

        if (!userOrgData) {
          console.log(`⚠️  User ${userRecord.email} not in organization`);
          continue;
        }

        // Set custom claims
        await auth.setCustomUserClaims(userRecord.uid, {
          organizationId,
          organizationRoles: userOrgData.roles || ['employee'],
        });

        console.log(`  ✅ Updated claims for ${userRecord.email}`);
      } catch (error) {
        console.error(`  ❌ Failed to update claims for ${userRecord.uid}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Failed to update auth claims:', error);
    stats.errors.push(`Auth claims: ${error}`);
  }
}

/**
 * Main migration function
 */
async function runMigration(): Promise<void> {
  console.log('🚀 Starting Multi-Tenant Migration');
  console.log('==================================');

  try {
    // Step 1: Create default organization
    const organizationId = await createDefaultOrganization();

    // Step 2: Migrate users
    await migrateUsers(organizationId);

    // Step 3: Migrate projects
    await migrateProjects(organizationId);

    // Step 4: Migrate tasks
    await migrateTasks(organizationId);

    // Step 5: Migrate invoices
    await migrateInvoices(organizationId);

    // Step 6: Migrate tickets
    await migrateTickets(organizationId);

    // Step 7: Update auth claims
    await updateAuthClaims(organizationId);

    // Print summary
    console.log('\n📊 Migration Summary');
    console.log('====================');
    console.log('Organizations:', stats.organizations);
    console.log('Users:', stats.users);
    console.log('Projects:', stats.projects);
    console.log('Tasks:', stats.tasks);
    console.log('Invoices:', stats.invoices);
    console.log('Tickets:', stats.tickets);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT: Deploy the updated security rules now!');
    console.log('Run: firebase deploy --only firestore:rules');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runMigration };