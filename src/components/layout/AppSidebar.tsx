import { useState } from "react";
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  Home, 
  Settings, 
  Target, 
  TrendingUp, 
  User,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainItems = [
  { title: "Главная", url: "/", icon: Home },
  { title: "Оценки", url: "/ratings", icon: Calendar },
  { title: "Аналитика", url: "/analytics", icon: BarChart3 },
  { title: "Стратегии", url: "/strategies", icon: Target },
  { title: "AI Коуч", url: "/ai-coach", icon: Brain },
];

const otherItems = [
  { title: "Настройки", url: "/settings", icon: Settings },
  { title: "Профиль", url: "/profile", icon: User },
  { title: "Помощь", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const hasActiveOther = otherItems.some(item => isActive(item.url));

  const getNavClass = (active: boolean) =>
    active 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border">
        {!collapsed && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-foreground">Life Quality Tracker</h2>
            <p className="text-sm text-muted-foreground">v2.0.0</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Основные разделы</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavClass(isActive(item.url))}
                    >
                      <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other Section */}
        <SidebarGroup>
          <Collapsible 
            open={isOtherOpen || hasActiveOther} 
            onOpenChange={setIsOtherOpen}
          >
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-foreground">
                Прочее
                {!collapsed && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOtherOpen || hasActiveOther ? 'rotate-180' : ''}`} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {otherItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end 
                          className={getNavClass(isActive(item.url))}
                        >
                          <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        {!collapsed && (
          <div className="p-4 text-xs text-muted-foreground">
            <p>© 2024 Life Quality Tracker</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
