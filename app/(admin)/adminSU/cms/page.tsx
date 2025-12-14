export default function CMSPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Content Management System</h1>
      <p className="text-gray-600">
        Welcome to the CMS. This module is restricted to owners only.
        Here you will be able to manage client-facing content, pricing configuration, and notification templates.
      </p>
      {/* CMS Modules will be added here */}
    </div>
  );
}
