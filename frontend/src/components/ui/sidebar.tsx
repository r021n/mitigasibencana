import * as React from "react";

// Sidebar Context for open/closed state management
interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  className = "",
  ...props
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div
        className={`flex min-h-screen w-full bg-background text-on-background ${className}`}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  className = "",
  ...props
}: SidebarMenuProps) {
  const { open } = useSidebar();

  // Dynamically shrink (w-20, px-3) or expand (w-64, p-6) based on open state with smooth transition
  return (
    <aside
      className={`flex flex-col h-screen fixed left-0 top-0 bg-surface-container-low shadow-lg z-40 border-r border-outline-variant/10 transition-all duration-300 ease-in-out ${
        open ? "w-64 p-6" : "w-20 py-6 px-3"
      } ${className}`}
      {...props}
    >
      {children}
    </aside>
  );
}

export interface SidebarContentProps extends React.ComponentProps<"div"> {}

export function SidebarContent({
  children,
  className = "",
  ...props
}: SidebarContentProps) {
  return (
    <div className={`flex-1 flex flex-col space-y-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface SidebarGroupProps extends React.ComponentProps<"div"> {}

export function SidebarGroup({
  children,
  className = "",
  ...props
}: SidebarGroupProps) {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface SidebarGroupLabelProps extends React.ComponentProps<"div"> {}

export function SidebarGroupLabel({
  children,
  className = "",
  ...props
}: SidebarGroupLabelProps) {
  const { open } = useSidebar();

  // Hide label text when sidebar is shrunk
  if (!open) return null;

  return (
    <div
      className={`font-caption text-caption text-on-surface-variant px-3 uppercase tracking-wider select-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SidebarGroupContentProps extends React.ComponentProps<"div"> {}

export function SidebarGroupContent({
  children,
  className = "",
  ...props
}: SidebarGroupContentProps) {
  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface SidebarMenuProps extends React.ComponentProps<"ul"> {}

export function SidebarMenu({
  children,
  className = "",
  ...props
}: SidebarMenuProps) {
  return (
    <ul className={`space-y-1.5 list-none p-0 m-0 ${className}`} {...props}>
      {children}
    </ul>
  );
}

export interface SidebarMenuItemProps extends React.ComponentProps<"li"> {}

export function SidebarMenuItem({
  children,
  className = "",
  ...props
}: SidebarMenuItemProps) {
  return (
    <li className={`${className}`} {...props}>
      {children}
    </li>
  );
}

export interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  isActive?: boolean;
}

export function SidebarMenuButton({
  children,
  className = "",
  asChild = false,
  isActive = false,
  ...props
}: SidebarMenuButtonProps) {
  // Notice: all hover states change instantly. NO transitions or animations here.
  const activeClass = isActive
    ? "bg-primary-container text-on-primary-container shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)] font-semibold"
    : "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-primary";

  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-xl font-label-md text-label-md text-left cursor-pointer border-none ${activeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
