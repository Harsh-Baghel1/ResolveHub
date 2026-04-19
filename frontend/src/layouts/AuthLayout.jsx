const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">

      {/* Left Branding */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white items-center justify-center flex-col">
        <h1 className="text-4xl font-bold">ResolveHub</h1>
        <p className="mt-2 text-lg opacity-80">
          Smart Complaint & SLA Management
        </p>
      </div>

      {/* Right Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100">
        {children}
      </div>

    </div>
  );
};

export default AuthLayout;