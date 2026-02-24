import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0d0620]">
      <div className="max-w-md w-full p-8 mx-4 bg-white/5 rounded-2xl border border-white/10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-500/20">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Access Restricted</h1>
        <p className="text-white/60 mb-6">
          You are not registered to use this application. Please contact the administrator to request access.
        </p>
        <div className="p-4 bg-white/5 rounded-xl text-sm text-white/50 text-left">
          <p className="mb-2">You can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verify you're logged in with the correct account</li>
            <li>Contact the app administrator for access</li>
            <li>Try logging out and back in again</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;