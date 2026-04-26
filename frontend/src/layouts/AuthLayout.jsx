// frontend/src/layouts/AuthLayout.jsx

const AuthLayout = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center px-10">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold mb-4">
            ResolveHub
          </h1>

          <p className="text-xl opacity-90 mb-3">
            Smart Complaint &
            SLA Management
          </p>

          <p className="text-sm opacity-75 leading-6">
            Manage tickets,
            resolve issues faster,
            monitor SLA targets,
            and improve support
            operations with one
            unified platform.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-5 py-10">
        {children}
      </div>

    </div>
  );
};

export default AuthLayout;