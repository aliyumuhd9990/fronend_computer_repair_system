import React from "react"; 

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3 mb-0 text-secondary">Loading FixDesk…</p>
    </div>
  );
}
