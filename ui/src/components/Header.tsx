import { Link, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import logo from "@/assets/logo.svg";
import { Shield, BarChart3, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { WalletButton } from "./WalletButton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: "All Polls", showAlways: true },
    { to: "/create-poll", label: "Create Poll", showAlways: false },
    { to: "/my-votes", label: "My Votes", showAlways: false },
    { to: "/dashboard", label: "Dashboard", showAlways: true, icon: BarChart3 },
  ];

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img src={logo} alt="Secret Vote Box Logo" className="h-10 w-10" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Community Voting
              </h1>
              <p className="text-sm text-muted-foreground">Secure & Private</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (!item.showAlways && !isConnected) return null;
                const isActive = location.pathname === item.to;
                
                return (
                  <motion.div
                    key={item.to}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <NavLink 
                      to={item.to}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        isActive 
                          ? "bg-primary/10 text-primary font-semibold" 
                          : "text-foreground/70 hover:text-foreground hover:bg-muted"
                      }`}
                      activeClassName=""
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <motion.div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                whileHover={{ scale: 1.02 }}
              >
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary hidden sm:inline">Encrypted</span>
              </motion.div>
              <WalletButton />
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.nav
          initial={false}
          animate={{ 
            height: mobileMenuOpen ? "auto" : 0,
            opacity: mobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="md:hidden overflow-hidden"
        >
          <div className="pt-4 pb-2 space-y-1">
            {navItems.map((item) => {
              if (!item.showAlways && !isConnected) return null;
              const isActive = location.pathname === item.to;
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      </div>
    </header>
  );
};

export default Header;
