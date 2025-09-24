#!/usr/bin/env tsx

/**
 * MAS Business OS - Database Seeding Script
 *
 * This script seeds the Firestore database with comprehensive demo data
 * for all modules of the MAS Business OS system.
 *
 * Usage:
 *   npm run seed                    # Seed all data
 *   npm run seed --modules=users    # Seed specific modules
 *   npm run seed --reset           # Clear and reseed all data
 *   npm run seed --dry-run         # Preview what would be seeded
 *
 * Environment Variables:
 *   FIREBASE_PROJECT_ID=mashub-a0725
 *   NODE_ENV=development|production
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  writeBatch,
  deleteDoc,
  getDocs,
  query,
  limit
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

// Import all seed data
import { organizations, settings } from '../seeds/organizations.seed';
import { departments } from '../seeds/departments.seed';
import { roles } from '../seeds/roles.seed';
import { users, userRoles } from '../seeds/users.seed';
import { accounts, clientSites } from '../seeds/accounts.seed';
import { projectTypes, projectTemplates, projects, phases, tasks } from '../seeds/projects.seed';
import { contracts, invoices, payments, transactions, finAccounts } from '../seeds/invoices.seed';
import { courses, lessons, quizzes, assignments } from '../seeds/courses.seed';
import { slaPolicies, tickets, ticketComments, visits } from '../seeds/tickets.seed';
import { candidates, interviews, onboardingTemplates, onboardingTasks } from '../seeds/candidates.seed';
import { products, digitalProducts, services, bundles, pricebooks, pricebookEntries, inventory } from '../seeds/products-services.seed';
import { announcements, notifications, portalInvites } from '../seeds/announcements.seed';

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'mashub-a0725',
  // Add other config if needed for local development
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

// Seeding configuration
interface SeedModule {
  name: string;
  description: string;
  collections: {
    name: string;
    data: any[];
    dependencies?: string[];
  }[];
}

const SEED_MODULES: SeedModule[] = [
  {
    name: 'core',
    description: 'Core system data (organizations, departments, roles)',
    collections: [
      { name: 'organizations', data: organizations },
      { name: 'settings', data: settings },
      { name: 'departments', data: departments },
      { name: 'roles', data: roles }
    ]
  },
  {
    name: 'users',
    description: 'Users and authentication data',
    collections: [
      { name: 'users', data: users, dependencies: ['departments'] },
      { name: 'userRoles', data: userRoles, dependencies: ['users', 'roles'] }
    ]
  },
  {
    name: 'accounts',
    description: 'Client accounts and sites',
    collections: [
      { name: 'accounts', data: accounts, dependencies: ['users'] },
      { name: 'clientSites', data: clientSites, dependencies: ['accounts'] }
    ]
  },
  {
    name: 'projects',
    description: 'Projects, tasks, and timesheets',
    collections: [
      { name: 'projectTypes', data: projectTypes },
      { name: 'projectTemplates', data: projectTemplates, dependencies: ['projectTypes'] },
      { name: 'projects', data: projects, dependencies: ['accounts', 'projectTypes', 'users'] },
      { name: 'phases', data: phases, dependencies: ['projects'] },
      { name: 'tasks', data: tasks, dependencies: ['projects', 'phases', 'users'] }
    ]
  },
  {
    name: 'finance',
    description: 'Invoices, payments, and financial data',
    collections: [
      { name: 'finAccounts', data: finAccounts },
      { name: 'contracts', data: contracts, dependencies: ['accounts'] },
      { name: 'invoices', data: invoices, dependencies: ['accounts', 'projects', 'contracts'] },
      { name: 'payments', data: payments, dependencies: ['invoices', 'accounts'] },
      { name: 'transactions', data: transactions, dependencies: ['finAccounts', 'projects'] }
    ]
  },
  {
    name: 'products',
    description: 'Products, services, and inventory',
    collections: [
      { name: 'products', data: [...products, ...digitalProducts] },
      { name: 'services', data: services },
      { name: 'bundles', data: bundles, dependencies: ['products', 'services'] },
      { name: 'pricebooks', data: pricebooks },
      { name: 'pricebookEntries', data: pricebookEntries, dependencies: ['pricebooks', 'products', 'services'] },
      { name: 'inventory', data: inventory, dependencies: ['products'] }
    ]
  },
  {
    name: 'support',
    description: 'Support tickets and SLA policies',
    collections: [
      { name: 'slaPolicies', data: slaPolicies },
      { name: 'tickets', data: tickets, dependencies: ['accounts', 'projects', 'slaPolicies', 'users'] },
      { name: 'ticketComments', data: ticketComments, dependencies: ['tickets', 'users'] },
      { name: 'visits', data: visits, dependencies: ['tickets', 'clientSites', 'users'] }
    ]
  },
  {
    name: 'lms',
    description: 'Learning management system data',
    collections: [
      { name: 'courses', data: courses },
      { name: 'lessons', data: lessons, dependencies: ['courses'] },
      { name: 'quizzes', data: quizzes, dependencies: ['courses', 'lessons'] },
      { name: 'assignments', data: assignments, dependencies: ['courses', 'users', 'accounts'] }
    ]
  },
  {
    name: 'hr',
    description: 'HR and recruitment data',
    collections: [
      { name: 'candidates', data: candidates },
      { name: 'interviews', data: interviews, dependencies: ['candidates', 'users'] },
      { name: 'onboardingTemplates', data: onboardingTemplates },
      { name: 'onboardingTasks', data: onboardingTasks, dependencies: ['users', 'onboardingTemplates'] }
    ]
  },
  {
    name: 'communication',
    description: 'Announcements, notifications, and portal invites',
    collections: [
      { name: 'announcements', data: announcements },
      { name: 'notifications', data: notifications, dependencies: ['users'] },
      { name: 'portalInvites', data: portalInvites, dependencies: ['accounts', 'candidates', 'users'] }
    ]
  }
];

// Utility functions
const addTimestamps = (data: any) => {
  const now = new Date();
  return {
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    createdBy: data.createdBy || 'seeder',
    updatedBy: data.updatedBy || 'seeder'
  };
};

const batchWrite = async (collectionName: string, documents: any[], batchSize = 500) => {
  const collectionRef = collection(db, collectionName);
  let batch = writeBatch(db);
  let batchCount = 0;
  let totalWritten = 0;

  for (const [index, document] of documents.entries()) {
    const docRef = doc(collectionRef, document.id);
    const processedDoc = addTimestamps(document);
    delete processedDoc.id; // Remove ID from document data

    batch.set(docRef, processedDoc);
    batchCount++;

    // Commit batch when it reaches the limit or it's the last document
    if (batchCount === batchSize || index === documents.length - 1) {
      await batch.commit();
      totalWritten += batchCount;

      // Start a new batch
      batch = writeBatch(db);
      batchCount = 0;
    }
  }

  return totalWritten;
};

const clearCollection = async (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(query(collectionRef, limit(500)));

  let batch = writeBatch(db);
  let count = 0;

  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });

  if (count > 0) {
    await batch.commit();
  }

  return count;
};

const seedModule = async (module: SeedModule, options: { dryRun?: boolean; verbose?: boolean } = {}) => {
  console.log(chalk.blue(`\n📦 Seeding module: ${module.name}`));
  console.log(chalk.gray(`   ${module.description}`));

  for (const collection of module.collections) {
    const spinner = ora(`Seeding ${collection.name} (${collection.data.length} records)`).start();

    try {
      if (options.dryRun) {
        spinner.succeed(`[DRY RUN] Would seed ${collection.data.length} records to ${collection.name}`);
      } else {
        const written = await batchWrite(collection.name, collection.data);
        spinner.succeed(`Seeded ${written} records to ${collection.name}`);
      }

      if (options.verbose && collection.data.length > 0) {
        console.log(chalk.gray(`   Sample record: ${JSON.stringify(collection.data[0], null, 2).substring(0, 100)}...`));
      }
    } catch (error) {
      spinner.fail(`Failed to seed ${collection.name}: ${error}`);
      throw error;
    }
  }
};

const clearModule = async (module: SeedModule, options: { dryRun?: boolean } = {}) => {
  console.log(chalk.yellow(`\n🗑️  Clearing module: ${module.name}`));

  // Clear in reverse order to handle dependencies
  for (const collection of [...module.collections].reverse()) {
    const spinner = ora(`Clearing ${collection.name}`).start();

    try {
      if (options.dryRun) {
        spinner.succeed(`[DRY RUN] Would clear collection ${collection.name}`);
      } else {
        const cleared = await clearCollection(collection.name);
        spinner.succeed(`Cleared ${cleared} records from ${collection.name}`);
      }
    } catch (error) {
      spinner.fail(`Failed to clear ${collection.name}: ${error}`);
      throw error;
    }
  }
};

const validateEnvironment = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error(chalk.red('❌ FIREBASE_PROJECT_ID environment variable is required'));
    process.exit(1);
  }

  const environment = process.env.NODE_ENV || 'development';

  console.log(chalk.green('✅ Environment validation passed'));
  console.log(chalk.gray(`   Project ID: ${projectId}`));
  console.log(chalk.gray(`   Environment: ${environment}`));

  return { projectId, environment };
};

// Main seeding function
const runSeeder = async (options: {
  modules?: string[];
  reset?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  force?: boolean;
}) => {
  const { projectId, environment } = validateEnvironment();

  // Safety check for production
  if (environment === 'production' && !options.force) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: chalk.yellow('⚠️  You are about to seed data in PRODUCTION. Are you sure?'),
        default: false
      }
    ]);

    if (!confirmed) {
      console.log(chalk.yellow('Seeding cancelled'));
      return;
    }
  }

  // Determine which modules to process
  const modulesToProcess = options.modules
    ? SEED_MODULES.filter(m => options.modules!.includes(m.name))
    : SEED_MODULES;

  if (modulesToProcess.length === 0) {
    console.error(chalk.red('❌ No valid modules specified'));
    return;
  }

  console.log(chalk.green(`\n🌱 Starting seeding process for ${modulesToProcess.length} modules`));

  if (options.dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No data will be written'));
  }

  try {
    // Clear data if reset is requested
    if (options.reset) {
      console.log(chalk.yellow('\n🔄 Reset mode: Clearing existing data'));

      for (const module of [...modulesToProcess].reverse()) {
        await clearModule(module, { dryRun: options.dryRun });
      }
    }

    // Seed modules in order (respecting dependencies)
    for (const module of modulesToProcess) {
      await seedModule(module, { dryRun: options.dryRun, verbose: options.verbose });
    }

    const totalRecords = modulesToProcess.reduce((sum, module) =>
      sum + module.collections.reduce((collSum, coll) => collSum + coll.data.length, 0), 0
    );

    console.log(chalk.green(`\n✅ Seeding completed successfully!`));
    console.log(chalk.gray(`   Total records processed: ${totalRecords}`));
    console.log(chalk.gray(`   Firebase Project: ${projectId}`));

    if (!options.dryRun) {
      console.log(chalk.blue('\n📋 Next steps:'));
      console.log(chalk.gray('   1. Test the application with the demo data'));
      console.log(chalk.gray('   2. Review the generated demo scenarios'));
      console.log(chalk.gray('   3. Check the multi-language content'));
      console.log(chalk.gray('   4. Verify all user portals are working'));
    }

  } catch (error) {
    console.error(chalk.red(`\n❌ Seeding failed: ${error}`));
    throw error;
  }
};

// CLI setup
const program = new Command();

program
  .name('seed')
  .description('Seed MAS Business OS database with demo data')
  .version('1.0.0');

program
  .option('-m, --modules <modules>', 'Comma-separated list of modules to seed (core,users,accounts,projects,finance,products,support,lms,hr,communication)')
  .option('-r, --reset', 'Clear existing data before seeding')
  .option('-d, --dry-run', 'Preview changes without writing to database')
  .option('-v, --verbose', 'Verbose output with sample data')
  .option('-f, --force', 'Force seeding in production environment')
  .action(async (options) => {
    try {
      const modules = options.modules ? options.modules.split(',').map((m: string) => m.trim()) : undefined;

      await runSeeder({
        modules,
        reset: options.reset,
        dryRun: options.dryRun,
        verbose: options.verbose,
        force: options.force
      });

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\n💥 Fatal error during seeding:'), error);
      process.exit(1);
    }
  });

// List available modules command
program
  .command('list')
  .description('List available seeding modules')
  .action(() => {
    console.log(chalk.blue('\n📋 Available seeding modules:'));

    SEED_MODULES.forEach(module => {
      const recordCount = module.collections.reduce((sum, coll) => sum + coll.data.length, 0);
      console.log(chalk.green(`\n  ${module.name}`));
      console.log(chalk.gray(`    ${module.description}`));
      console.log(chalk.gray(`    Collections: ${module.collections.map(c => c.name).join(', ')}`));
      console.log(chalk.gray(`    Total records: ${recordCount}`));
    });

    console.log(chalk.blue('\n💡 Usage examples:'));
    console.log(chalk.gray('   npm run seed                     # Seed all modules'));
    console.log(chalk.gray('   npm run seed -m core,users       # Seed specific modules'));
    console.log(chalk.gray('   npm run seed --reset             # Clear and reseed all data'));
    console.log(chalk.gray('   npm run seed --dry-run           # Preview without changes'));
  });

// Status command to check current data
program
  .command('status')
  .description('Check current database status')
  .action(async () => {
    validateEnvironment();

    console.log(chalk.blue('\n📊 Current database status:'));

    for (const module of SEED_MODULES) {
      console.log(chalk.green(`\n  ${module.name}:`));

      for (const collection of module.collections) {
        try {
          const snapshot = await getDocs(query(collection(db, collection.name), limit(1)));
          const count = snapshot.size > 0 ? '✅ Has data' : '⭕ Empty';
          console.log(chalk.gray(`    ${collection.name}: ${count}`));
        } catch (error) {
          console.log(chalk.red(`    ${collection.name}: ❌ Error checking`));
        }
      }
    }
  });

// Help text
program.addHelpText('after', `
Examples:
  $ npm run seed                          Seed all demo data
  $ npm run seed -m core,users           Seed only core and user data
  $ npm run seed --reset                 Clear existing data and reseed
  $ npm run seed --dry-run --verbose     Preview with detailed output
  $ npm run seed list                    Show available modules
  $ npm run seed status                  Check current database state

Environment Variables:
  FIREBASE_PROJECT_ID     Firebase project ID (required)
  NODE_ENV               Environment (development/production)

For more information, visit: https://github.com/a7mdelbanna/mas-hub
`);

// Run the CLI
if (require.main === module) {
  program.parse();
}

export { runSeeder, SEED_MODULES };