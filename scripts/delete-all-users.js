const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mashub-a0725'
});

async function deleteAllUsers() {
  try {
    console.log('Fetching all users...');
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;

    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    console.log(`Found ${users.length} users. Deleting...`);

    for (const user of users) {
      console.log(`Deleting user: ${user.email} (${user.uid})`);
      await admin.auth().deleteUser(user.uid);

      // Also delete Firestore document
      try {
        await admin.firestore().collection('users').doc(user.uid).delete();
        console.log(`  - Deleted Firestore document for ${user.uid}`);
      } catch (err) {
        console.log(`  - No Firestore document found for ${user.uid}`);
      }
    }

    console.log('\n✅ All users deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting users:', error);
    process.exit(1);
  }
}

deleteAllUsers();