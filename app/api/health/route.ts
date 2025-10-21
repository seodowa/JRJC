import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  const healthChecks = {
    database: { status: 'unknown', error: null },
    auth_endpoints: {}
  };

  try {
    // 1. Test Database Connection (your existing test)
    const { data: dbData, error: dbError } = await supabase
      .from("Accounts")
      .select("ID")
      .limit(1);

    healthChecks.database = dbError 
      ? { status: 'error', error: dbError.message }
      : { status: 'healthy', error: null };

    // 2. Test All Auth Endpoints
    healthChecks.auth_endpoints = {
      login: await testLoginEndpoint(supabase),
      signup: await testSignupEndpoint(supabase),
      logout: await testLogoutEndpoint(supabase),
      session: await testSessionEndpoint(supabase),
      verify_otp: await testVerifyOtpEndpoint(supabase)
    };

    // Overall status
    const allHealthy = checkOverallHealth(healthChecks);

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      ...healthChecks
    }, { 
      status: allHealthy ? 200 : 207
    });

  } catch (e: any) {
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: e.message ?? "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Test Login Endpoint Dependencies
async function testLoginEndpoint(supabase: any) {
  try {
    // Test the exact query used in login route
    const { data, error } = await supabase
      .from('Accounts')
      .select('"ID", "Username", "Password", "Email"')
      .limit(1);

    if (error) {
      return { status: 'error', details: `Query failed: ${error.message}` };
    }

    // Check if required columns exist
    const sampleUser = data && data[0];
    const missingColumns = [];
    
    if (sampleUser) {
      if (!sampleUser.hasOwnProperty('ID')) missingColumns.push('ID');
      if (!sampleUser.hasOwnProperty('Username')) missingColumns.push('Username');
      if (!sampleUser.hasOwnProperty('Password')) missingColumns.push('Password');
      if (!sampleUser.hasOwnProperty('Email')) missingColumns.push('Email');
    }

    if (missingColumns.length > 0) {
      return { 
        status: 'degraded', 
        details: `Missing columns: ${missingColumns.join(', ')}` 
      };
    }

    return { 
      status: 'healthy', 
      details: `Login query working, ${data.length} records found` 
    };

  } catch (error: any) {
    return { status: 'error', details: error.message };
  }
}

// Test Signup Endpoint Dependencies  
async function testSignupEndpoint(supabase: any) {
  try {
    // Test if we can access Accounts table for signup
    const { data, error } = await supabase
      .from('Accounts')
      .select('"ID", "Username", "Email"')
      .limit(1);

    if (error) {
      return { status: 'error', details: `Signup check failed: ${error.message}` };
    }

    return { 
      status: 'healthy', 
      details: 'Signup dependencies available' 
    };

  } catch (error: any) {
    return { status: 'error', details: error.message };
  }
}

// Test Logout Endpoint Dependencies
async function testLogoutEndpoint(supabase: any) {
  try {
    // Test auth session access (used in logout)
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { status: 'error', details: `Session check failed: ${error.message}` };
    }

    return { 
      status: 'healthy', 
      details: `Logout ready, ${session ? 'active session' : 'no session'}` 
    };

  } catch (error: any) {
    return { status: 'error', details: error.message };
  }
}

// Test Session Endpoint Dependencies
async function testSessionEndpoint(supabase: any) {
  try {
    // Test session retrieval
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { status: 'error', details: `Session retrieval failed: ${error.message}` };
    }

    return { 
      status: 'healthy', 
      details: `Session endpoint working` 
    };

  } catch (error: any) {
    return { status: 'error', details: error.message };
  }
}

// Test Verify OTP Endpoint Dependencies
async function testVerifyOtpEndpoint(supabase: any) {
  try {
    // Test if we can access verification token columns
    const { data, error } = await supabase
      .from('Accounts')
      .select('"ID", verification_token, verification_token_expires_at')
      .limit(1);

    if (error) {
      return { status: 'error', details: `OTP verification check failed: ${error.message}` };
    }

    return { 
      status: 'healthy', 
      details: 'OTP verification dependencies available' 
    };

  } catch (error: any) {
    return { status: 'error', details: error.message };
  }
}

// Helper function to check overall health
function checkOverallHealth(healthChecks: any) {
  const allDbChecks = [
    healthChecks.database.status,
    healthChecks.auth_endpoints.login.status,
    healthChecks.auth_endpoints.signup.status,
    healthChecks.auth_endpoints.logout.status, 
    healthChecks.auth_endpoints.session.status,
    healthChecks.auth_endpoints.verify_otp.status
  ];

  return allDbChecks.every(status => status === 'healthy');
}