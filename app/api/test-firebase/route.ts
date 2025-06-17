import { testFirebaseConnection } from '@/firebase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const isConnected = await testFirebaseConnection();
        
        if (isConnected) {
            return NextResponse.json({ 
                status: 'success', 
                message: 'Firebase connection successful!' 
            });
        } else {
            return NextResponse.json({ 
                status: 'error', 
                message: 'Firebase connection failed' 
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ 
            status: 'error', 
            message: 'Firebase connection failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
} 