// import { ThemeProvider, CssBaseline, Box } from "@mui/material";
// import { BrowserRouter } from "react-router-dom";
// import theme from "./app/theme";
// import Navbar from "./components/layout/Navbar";
// import Sidebar from "./components/layout/Sidebar";
// import AppRoutes from "./app/routes";
// import { Web3Provider } from "./web3/Web3Context";

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Web3Provider>
//         <BrowserRouter>
//           <Navbar />
//           <Sidebar />

//           <Box
//             component="main"
//             sx={{
//               ml: 28,
//               mt: 10,
//               p: 3,
//               minHeight: "100vh",
//             }}
//           >
//             <AppRoutes />
//           </Box>
//         </BrowserRouter>
//       </Web3Provider>
//     </ThemeProvider>
//   );
// }

// export default App;



import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import theme from "./app/theme";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import AppRoutes from "./app/routes";
import { Web3Provider } from "./web3/Web3Context";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3Provider>
        <BrowserRouter>
          <Navbar />
          <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                mt: 10,
                p: 3,
                minHeight: "100vh",
              }}
            >
              <AppRoutes />
            </Box>
          </Box>
        </BrowserRouter>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;