import logo from "./logo.svg";
import "./App.css";
import Map from "./components/Map";
import About from "./components/About";
import "locomotive-scroll/dist/locomotive-scroll.css";

import { AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import { ThemeProvider } from "styled-components";

import Loader from "./components/Loader";
import ScrollTriggerProxy from "./components/ScrollTriggerProxy";
import GlobalStyles from "./styles/GlobalStyles";
import { dark } from "./styles/Themes";

function App() {
  const containerRef = useRef(null);
  const [Loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 3000);
  }, []);

  return (
    <>
      <GlobalStyles />
      <ThemeProvider theme={dark}>
        <AnimatePresence>{Loaded ? null : <Loader />}</AnimatePresence>

        <LocomotiveScrollProvider
          options={{
            smooth: true,
            smartphone: {
              smooth: true,
            },
            tablet: {
              smooth: true,
            },
          }}
          watch={[]}
          containerRef={containerRef}
        >
          <main className="App" data-scroll-container ref={containerRef}>
            <ScrollTriggerProxy />
            {/* <AnimatePresence>
              {Loaded ? <About /> : <Loader />}
            </AnimatePresence> */}
            {/* The Map component is now outside of the LocomotiveScrollProvider */}
        <Map />
          </main>
        </LocomotiveScrollProvider>

        
      </ThemeProvider>
    </>
  );
}

export default App;
