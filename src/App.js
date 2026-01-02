import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { EnumProvider } from "./Context/EnumContext";

function App() {
  return (
    <BrowserRouter>
      <EnumProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </EnumProvider>
    </BrowserRouter>
  );
}

export default App;
