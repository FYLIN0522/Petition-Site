import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NotFound from "./components/NotFound";
import Petitions from "./components/Petitions";
import Petition from "./components/Petition";
import Register from "./components/Register";
import Login from "./components/Login";
import CreatePetiton from "./components/CreatePetiton";
import MyPetitons from "./components/MyPetitons";
import EditPetiton from "./components/EditPetiton";
import SupportTier from "./components/SupportTier";
import EditProfile from "./components/EditProfile";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<Petitions/>}/>
              <Route path="/petitions/:id" element={<Petition/>}/>
              <Route path="*" element={<NotFound/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/create" element={<CreatePetiton/>}/>
              <Route path="/myPetiton" element={<MyPetitons/>}/>
              <Route path="/edit/:id" element={<EditPetiton/>}/>
              <Route path="/petitions/:id/:tierId" element={<SupportTier/>}/>
              <Route path="/editProfile" element={<EditProfile/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}
export default App;
