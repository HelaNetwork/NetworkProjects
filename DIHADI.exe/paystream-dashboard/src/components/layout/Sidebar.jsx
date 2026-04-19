// import { Drawer, List, ListItem, ListItemText } from "@mui/material";
// import { Link } from "react-router-dom";

// const drawerWidth = 220;

// export default function Sidebar() {
//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         width: drawerWidth,
//         "& .MuiDrawer-paper": {
//           width: drawerWidth,
//           boxSizing: "border-box",
//           mt: 8,
//         },
//       }}
//     >
//       <List>
//         <ListItem button component={Link} to="/">
//           <ListItemText primary="Dashboard" />
//         </ListItem>
//         <ListItem button component={Link} to="/treasury">
//           <ListItemText primary="Treasury" />
//         </ListItem>
//         <ListItem button component={Link} to="/streams">
//           <ListItemText primary="Streams" />
//         </ListItem>
//         <ListItem button component={Link} to="/employee">
//           <ListItemText primary="Employee" />
//         </ListItem>
//         <ListItem button component={Link} to="/admin">
//           <ListItemText primary="Admin" />
//         </ListItem>
//       </List>
//     </Drawer>
//   );
// }
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import {
  GridView,
  AccountBalance,
  StreamRounded,
  Badge,
  AdminPanelSettings,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", to: "/", icon: <GridView fontSize="small" /> },
  { label: "Treasury", to: "/treasury", icon: <AccountBalance fontSize="small" /> },
  { label: "Streams", to: "/streams", icon: <StreamRounded fontSize="small" /> },
  { label: "Employee", to: "/employee", icon: <Badge fontSize="small" /> },
  { label: "Admin", to: "/admin", icon: <AdminPanelSettings fontSize="small" /> },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: 8,
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        },
      }}
    >
      {/* Optional branding / section header */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography
          variant="overline"
          sx={{ color: "text.disabled", letterSpacing: 1.5, fontSize: "0.65rem" }}
        >
          Main Menu
        </Typography>
      </Box>

      <Divider />

      <List disablePadding sx={{ px: 1.5, pt: 1 }}>
        {navItems.map(({ label, to, icon }) => {
          const isActive = pathname === to;

          return (
            <ListItem key={to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={to}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.5,
                  transition: "all 0.15s ease",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:not(.Mui-selected):hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? "inherit" : "text.secondary",
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}