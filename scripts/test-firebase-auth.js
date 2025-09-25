import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';

// Your Firebase config from the .env file
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

console.log('🔥 Testing Firebase Authentication...\n');

async function testAuth() {
  const testCases = [
    { email: 'admin@mashub.com', password: 'Admin@123456', role: 'Admin' },
    { email: 'employee@mashub.com', password: 'Employee@123456', role: 'Employee' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing ${testCase.role} login...`);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        testCase.email,
        testCase.password
      );

      console.log(`✅ ${testCase.role} authentication successful!`);
      console.log(`   User ID: ${userCredential.user.uid}`);
      console.log(`   Email: ${userCredential.user.email}`);

      // Get ID token to check custom claims
      const idToken = await userCredential.user.getIdToken();
      console.log(`   ID Token obtained: ${idToken.substring(0, 20)}...`);

      // Sign out
      await auth.signOut();
      console.log(`   Signed out successfully\n`);

    } catch (error) {
      console.error(`❌ ${testCase.role} authentication failed:`, error.message);
      console.error(`   Error code: ${error.code}\n`);
    }
  }
}

// Run the test
testAuth().then(() => {
  console.log('🎉 All authentication tests completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});