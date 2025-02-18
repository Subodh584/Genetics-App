import React from "react";
import Home from "./Components/Home";
import Test from "./Components/Test";
import {Routes,Route,BrowserRouter} from 'react-router-dom';
import './Styles.css'


function App() {
  return (
<BrowserRouter>
    <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/test" element={<Test/>}/>
    </Routes>
</BrowserRouter>

  );
}

export default App;
