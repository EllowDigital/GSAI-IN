import React from "react";
export default function NotFoundAdmin() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">404 – Not Found</h2>
      <p className="mb-3 text-gray-600">Sorry, the admin page you requested could not be found.</p>
    </div>
  );
}
