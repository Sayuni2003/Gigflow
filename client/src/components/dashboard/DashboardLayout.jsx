import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";

const DashboardLayout = ({ navItems, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-main">
      <DashboardSidebar
        items={navItems}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
      />

      <div className="min-w-0 flex-1 px-5 py-8 lg:px-8">{children}</div>
    </div>
  );
};

export default DashboardLayout;
