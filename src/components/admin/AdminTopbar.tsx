
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAdminAuth } from "@/pages/admin/AdminAuthProvider";

interface AdminTopbarProps {
  onSignOut?: () => void;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ onSignOut }) => (
  <header className="sticky top-0 z-30 bg-white shadow-lg rounded-2xl mx-2 md:mx-4 mt-2 md:mt-4 px-4 py-2 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <SidebarTrigger className="md:hidden mr-2" />
      <h2 className="font-bold text-xl text-yellow-400">Admin Dashboard</h2>
    </div>
    <Button
      variant="secondary"
      size="sm"
      onClick={onSignOut}
      className="flex items-center gap-2 rounded-full hidden md:flex"
    >
      <LogOut size={18} /> Logout
    </Button>
  </header>
);

export default AdminTopbar;
