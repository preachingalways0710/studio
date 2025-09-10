'use client';

import { Dashboard } from '@/components/dashboard';
import { useState, useEffect } from 'react';
import type { Student, HelperAttendance } from '@/lib/types';
import React from 'react';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from './ui/button';
import { ExternalLink, AlertCircle, Wifi, Shield, Database, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ANONYMOUS_USER_ID = 'shared-user-id';

export function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [helperAttendance, setHelperAttendance] = useState<HelperAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    code?: string;
    type?: 'network' | 'permission' | 'configuration' | 'unknown';
    originalError?: any;
  } | null>(null);

  useEffect(() => {
    const userId = ANONYMOUS_USER_ID;
    let unsubscribers: (() => void)[] = [];

    try {
      // Listener for students
      const studentQuery = query(collection(db, 'students'), where('userId', '==', userId));
      const studentsUnsubscribe = onSnapshot(studentQuery, (snapshot) => {
        const updatedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student);
        setStudents(updatedStudents);
        setLoading(false);
        setError(null); 
        setErrorDetails(null); 
      }, (err) => {
        console.error("Error fetching students:", err);
        
        // Enhanced error diagnostics
        let errorType: 'network' | 'permission' | 'configuration' | 'unknown' = 'unknown';
        let userMessage = "Could not connect to the student database.";
        
        if (err.code) {
          switch (err.code) {
            case 'permission-denied':
              errorType = 'permission';
              userMessage = "Permission denied. Please ensure Firestore is configured with proper read/write permissions.";
              break;
            case 'unavailable':
              errorType = 'network';
              userMessage = "Database temporarily unavailable. Please check your internet connection.";
              break;
            case 'not-found':
              errorType = 'configuration';
              userMessage = "Database not found. Please verify your Firebase project configuration.";
              break;
            case 'failed-precondition':
              errorType = 'configuration';
              userMessage = "Database not properly initialized. Please ensure Firestore is enabled in your Firebase project.";
              break;
            default:
              userMessage = `Database error: ${err.code}. Please check your Firebase configuration.`;
          }
        } else if (err.message && err.message.includes('network')) {
          errorType = 'network';
          userMessage = "Network connection failed. Please check your internet connection and try again.";
        }
        
        setError(userMessage);
        setErrorDetails({
          code: err.code,
          type: errorType,
          originalError: err
        });
        setLoading(false);
      });
      unsubscribers.push(studentsUnsubscribe);

      // Listener for helpers
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const currentYear = new Date().getFullYear();
      const helperDocId = `${userId}_${currentMonth}_${currentYear}`;
      const helperDocRef = doc(db, 'helpers', helperDocId);
      const helperUnsubscribe = onSnapshot(helperDocRef, (doc) => {
        if (doc.exists()) {
          setHelperAttendance(doc.data() as HelperAttendance);
        } else {
          setHelperAttendance({ userId, month: currentMonth, year: currentYear, count: 0 });
        }
      }, (err) => {
        console.error("Error fetching helpers:", err);
        // This error is less critical, so we don't set the main error state
      });
      unsubscribers.push(helperUnsubscribe);

    } catch (e: any) {
        console.error("Error setting up listeners:", e);
        
        // Enhanced error diagnostics for setup errors
        let errorType: 'network' | 'permission' | 'configuration' | 'unknown' = 'configuration';
        let userMessage = "Failed to initialize database connection.";
        
        if (e.code) {
          switch (e.code) {
            case 'invalid-argument':
              errorType = 'configuration';
              userMessage = "Invalid Firebase configuration. Please check your project settings.";
              break;
            case 'unauthenticated':
              errorType = 'permission';
              userMessage = "Authentication failed. Please check your Firebase authentication settings.";
              break;
            default:
              userMessage = `Setup error: ${e.code}. Please verify your Firebase configuration.`;
          }
        }
        
        setError(userMessage);
        setErrorDetails({
          code: e.code,
          type: errorType,
          originalError: e
        });
        setLoading(false);
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 animate-pulse text-primary"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <p className="text-muted-foreground">Connecting to Database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const firebaseUrl = `https://console.firebase.google.com/project/studio-6494355702-581e6/firestore`;
    
    // Enhanced diagnostics
    const isOnline = navigator.onLine;
    const currentTime = new Date().toLocaleString();
    const userAgent = navigator.userAgent;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const getTroubleshootingSteps = () => {
      const steps = [];
      
      if (errorDetails?.type === 'network' || !isOnline) {
        steps.push({
          icon: Wifi,
          title: "Check Network Connection",
          description: "Ensure you have a stable internet connection",
          action: () => window.location.reload()
        });
      }
      
      if (errorDetails?.type === 'permission') {
        steps.push({
          icon: Shield,
          title: "Fix Database Permissions",
          description: "Set Firestore rules to Test mode for development",
          details: `Go to Firebase Console → Firestore → Rules and ensure read/write is allowed`
        });
      }
      
      if (errorDetails?.type === 'configuration' || errorDetails?.code === 'not-found') {
        steps.push({
          icon: Database,
          title: "Verify Database Setup",
          description: "Ensure Firestore database is created and properly configured",
          details: "1. Create Firestore database\n2. Choose a location\n3. Start in Test mode"
        });
      }
      
      // Always include general troubleshooting
      steps.push({
        icon: RefreshCw,
        title: "General Troubleshooting",
        description: "Try these common fixes",
        details: "• Clear browser cache\n• Disable browser extensions\n• Try incognito/private mode\n• Check Firebase project status"
      });
      
      return steps;
    };

    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Failed</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{error}</p>
              {errorDetails?.code && (
                <p className="text-sm text-muted-foreground">
                  Error Code: <code className="bg-background px-1 rounded">{errorDetails.code}</code>
                </p>
              )}
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Diagnostics Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Connection Status:</span>
                  <span className={isOnline ? "text-green-600" : "text-red-600"}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span>{isLocalhost ? "Local Development" : "Production"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Type:</span>
                  <span className="capitalize">{errorDetails?.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{currentTime}</span>
                </div>
                {errorDetails?.code && (
                  <div className="flex justify-between">
                    <span>Firebase Error:</span>
                    <code className="text-xs bg-background px-1 rounded">{errorDetails.code}</code>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
                <Button asChild className="w-full">
                  <a href={firebaseUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Firebase Console
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (errorDetails?.originalError) {
                      console.log('Full error details:', errorDetails.originalError);
                      alert('Check browser console for detailed error information');
                    }
                  }}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  View Error Details
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Troubleshooting Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {getTroubleshootingSteps().map((step, index) => (
                  <div key={index} className="flex gap-3 p-3 border rounded-lg">
                    <step.icon className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      {step.details && (
                        <pre className="text-xs bg-background p-2 rounded whitespace-pre-wrap">
                          {step.details}
                        </pre>
                      )}
                      {step.action && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={step.action}
                          className="mt-2"
                        >
                          Try This Fix
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>If the issue persists after trying the steps above:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Check the <strong>browser console</strong> for additional error messages (F12 → Console)</li>
                <li>Verify your Firebase project is active and not suspended</li>
                <li>Ensure your Firebase plan supports Firestore usage</li>
                <li>Review the <a href="https://firebase.google.com/docs/firestore" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firestore documentation</a></li>
                <li>Check <a href="https://status.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase status page</a> for service outages</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      students={students} 
      helperAttendance={helperAttendance} 
    />
  );
}
