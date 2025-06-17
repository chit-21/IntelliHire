import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
    try {
        // Try to get the current timestamp from Firestore
        const timestamp = await db.collection('_test').doc('_test').get();
        console.log('✅ Firebase connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        return false;
    }
};

// sdk(admin side)
const initFirebaseAdmin=()=>{
    const apps=getApps();

    if(!apps.length){
        initializeApp({
            credential:cert({
                projectId:process.env.FIREBASE_PROJECT_ID,
                clientEmail:process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n")
            })
        })
    }

    return {
        auth:getAuth(),
        db:getFirestore()
    }
}

export const {auth,db}=initFirebaseAdmin();


