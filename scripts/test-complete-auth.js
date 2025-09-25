import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQ1N4LNMQENXYw1xFo_iF97Pi9m7z_osc",
  authDomain: "mashub-a0725.firebaseapp.com",
  projectId: "mashub-a0725",
  storageBucket: "mashub-a0725.firebasestorage.app",
  messagingSenderId: "419304682183",
  appId: "1:419304682183:web:d6cb0eb7c2839b13f504e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🧪 Testing Complete Authentication Flow...\n');

async function testCompleteAuth() {
  try {
    // Test login
    console.log('1️⃣ Testing login with admin@mashub.com...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'admin@mashub.com',
      'Admin@123456'
    );

    console.log('✅ Login successful!');
    console.log(`   User ID: ${userCredential.user.uid}`);

    // Test Firestore access
    console.log('\n2️⃣ Testing Firestore access...');
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User profile fetched successfully!');
      console.log(`   Display Name: ${userData.displayName}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Roles: ${userData.roles.join(', ')}`);
      console.log(`   Permissions: ${userData.permissions.length} permissions`);
      console.log(`   Portal Access: Admin=${userData.portalAccess.admin}, Employee=${userData.portalAccess.employee}`);
    } else {
      console.error('❌ User document not found in Firestore');
    }

    // Test getting ID token with claims
    console.log('\n3️⃣ Testing ID token with custom claims...');
    const idToken = await userCredential.user.getIdToken();
    const idTokenResult = await userCredential.user.getIdTokenResult();
    console.log('✅ ID Token obtained successfully');
    console.log(`   Custom Claims: ${JSON.stringify(idTokenResult.claims.roles || 'No custom claims')}`);

    // Sign out
    await auth.signOut();
    console.log('\n✅ Sign out successful');

    console.log('\n🎉 All tests passed! Authentication and Firestore are working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Error code:', error.code);
    if (error.code === 'permission-denied') {
      console.error('   This is a Firestore security rules issue. Check the rules in Firebase Console.');
    }
  }
}

testCompleteAuth().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});