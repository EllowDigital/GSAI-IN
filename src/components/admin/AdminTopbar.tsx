
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const AdminTopbar: React.FC = () => (
  <header className="sticky top-0 z-30 bg-white/80 backdrop-blur shadow-lg rounded-b-2xl mx-0 md:mx-0 mt-0 px-2 lg:px-8 py-2 flex items-center justify-between min-h-[58px] border-b border-yellow-100">
    <div className="flex items-center gap-2 md:gap-4 w-full">
      <SidebarTrigger className="md:hidden mr-0" />
      <h2 className="font-bold text-xl xs:text-2xl tracking-tight text-yellow-400 font-montserrat py-1 px-2 md:px-0">
        Admin Dashboard
      </h2>
    </div>
  </header>
);

export default AdminTopbar;
