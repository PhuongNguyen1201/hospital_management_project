"use client"
import Link from "next/link"
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ToastAction } from "@radix-ui/react-toast"
import { useToast } from "@/hooks/use-toast"
import { LinkBaseRoleType } from "@/types"

interface HeaderProps{
  links:LinkBaseRoleType|null|undefined
}


const Header = ({links}:HeaderProps) => {
  const linkList: string[] = links?.link ?? [];
  const {toast}=useToast();
  const handleLogOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET', // Hoặc 'GET' nếu bạn đang sử dụng phương thức GET
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          variant:"success",
          title: "Logout Notification",
          description: data.message,
          action: <ToastAction altText="Try again">OK</ToastAction>,
        });
        window.location.href = '/auth/login'; // Thay đổi trang đăng nhập
       
       
      } else {
        toast({
          variant:"destructive",
          title: "Logout Notification",
          description: data.message,
          action: <ToastAction altText="Try again">OK</ToastAction>,
        });
        // Redirect hoặc cập nhật state ở đây
      }
    } catch (error) {
        toast({
          variant:"destructive",
          title: "Logout Notification",
          description: 'An error occurred while logging out',
          action: <ToastAction altText="Try again">OK</ToastAction>,
        });
    }
  };
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                {
                linkList.map((link, index) => (
                  <Link
                    key={index} // Hoặc sử dụng một giá trị duy nhất như `link`
                    href={`/main/${link}`}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-4 w-4" />
                    {link.charAt(0).toUpperCase() + link.slice(1).toLowerCase()}
                  </Link>
                ))
              }
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our
                      support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
  )
}
export default Header
