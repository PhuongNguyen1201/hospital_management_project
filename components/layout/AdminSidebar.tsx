"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation'; // Hook mới để theo dõi thay đổi đường dẫn
import {
  Home,
  Package2,
  Settings,
  FileText,
  DollarSign,
  User,
  UserRoundPlus,
  Clipboard,
  ChevronDown,
  ChevronUp,
  ClipboardPen,
} from "lucide-react";
import { LinkBaseRoleType } from "@/types";

interface SidebarProps {
  links: LinkBaseRoleType | null | undefined;
}

const Sidebar = ({ links }: SidebarProps) => {
  const [openLink, setOpenLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const pathname = usePathname(); // Hook to get the current pathname
  const [selectedLink, setSelectedLink] = useState<string>(pathname || "/"); // Set default active link to '/'

  useEffect(() => {
    // Update selected link based on pathname change
    setSelectedLink(pathname || "/");
  }, [pathname]);

  const handleToggle = (path: string, event: React.MouseEvent) => {
    event.preventDefault();
    setOpenLink(openLink === path ? null : path);
  };

  const linkList: Array<{
    path: string;
    name: string;
    subLinks?: Array<{ path: string; name: string }> ;
  }> = links?.links ?? [];

  const getIconForLink = (path: string) => {
    switch (path) {
      case '/':
        return <Home className="h-4 w-4" />;
      case 'newpatient':
        return <UserRoundPlus className="h-4 w-4" />;
      case 'medical_records':
        return <FileText className="h-4 w-4" />;
      case 'services':
        return <Package2 className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'payment/detailpayment':
        return <Clipboard className="h-4 w-4" />;
      case 'setting':
        return <Settings className="h-4 w-4" />;
      case 'cartegory':
        return <FileText className="h-4 w-4" />;
      case 'receivepatient':
        return <User className="h-4 w-4" />;
      default:
        return <ClipboardPen className="h-4 w-4" />;
    }
  };

  const getIconForSubLink = (path: string) => {
    switch (path) {
      case 'cartegory/user':
        return <User className="h-4 w-4" />;
      case 'cartegory/bed':
        return <FileText className="h-4 w-4" />;
      case 'cartegory/department':
        return <Settings className="h-4 w-4" />;
      case 'cartegory/permission':
        return <Clipboard className="h-4 w-4" />;
      case 'cartegory/medical':
        return <DollarSign className="h-4 w-4" />;
      case 'cartegory/position':
        return <Home className="h-4 w-4" />;
      case 'cartegory/room':
        return <Package2 className="h-4 w-4" />;
      case 'cartegory/room_catalogue':
        return <FileText className="h-4 w-4" />;
      case 'cartegory/medical_catalogue':
        return <Settings className="h-4 w-4" />;
      case 'cartegory/service':
        return <Package2 className="h-4 w-4" />;
      case 'cartegory/service_catalogue':
        return <FileText className="h-4 w-4" />;
      case 'cartegory/location':
        return <Clipboard className="h-4 w-4" />;
      default:
        return <ClipboardPen className="h-4 w-4" />;
    }
  };

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Acme Inc</span>
          </Link>
        </div>
        {loading && <div className="spinner mt-4 mx-auto">Loading...</div>} {/* Hiển thị spinner */}
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {linkList.map((link, index) => (
              <div key={index}>
                <div>
                  <Link
                    href={`/main/${link.path}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      selectedLink === `/main/${link.path}` ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={(e) => {
                      if (link.subLinks) {
                        handleToggle(link.path, e);
                        return;
                      }
                      setSelectedLink(`/main/${link.path}`);
                    }}
                  >
                    {getIconForLink(link.path)}
                    {link.name}
                    {link.subLinks && (
                      <span className="ml-auto">
                        {openLink === link.path ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </Link>
                </div>
                {link.subLinks && openLink === link.path && (
                  <div className="ml-4">
                    {link.subLinks.map((subLink, subIndex) => (
                      <Link
                        key={subIndex}
                        href={`/main/${subLink.path}`}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                          selectedLink === `/main/${subLink.path}`
                            ? "bg-blue-500 text-white"
                            : ""
                        }`}
                        onClick={() => setSelectedLink(`/main/${subLink.path}`)}
                      >
                        {getIconForSubLink(subLink.path)}
                        {subLink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
