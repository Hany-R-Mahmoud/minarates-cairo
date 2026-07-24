import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Monuments from "./pages/Monuments";
import MonumentDetail from "./pages/MonumentDetail";
import MapPage from "./pages/MapPage";
import Walks from "./pages/Walks";
import WalkDetail from "./pages/WalkDetail";
import Periods from "./pages/Periods";
import Compare from "./pages/Compare";
import Detective from "./pages/Detective";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import Itinerary from "./pages/Itinerary";
import Notebook from "./pages/Notebook";
import CuratorStudio from "./pages/CuratorStudio";
import ArchitectureAtlas from "./pages/ArchitectureAtlas";
import Timeline from "./pages/Timeline";
import SiteLayout from "./components/SiteLayout";

function Router() {
  return (
    <SiteLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/monuments" component={Monuments} />
        <Route path="/monuments/:slug" component={MonumentDetail} />
        <Route path="/map" component={MapPage} />
        <Route path="/walks" component={Walks} />
        <Route path="/walks/:slug" component={WalkDetail} />
        <Route path="/periods" component={Periods} />
        <Route path="/architecture" component={ArchitectureAtlas} />
        <Route path="/timeline" component={Timeline} />
        <Route path="/compare" component={Compare} />
        <Route path="/detective" component={Detective} />
        <Route path="/stories" component={Stories} />
        <Route path="/stories/:slug" component={StoryDetail} />
        <Route path="/itinerary" component={Itinerary} />
        <Route path="/notebook" component={Notebook} />
        <Route path="/studio" component={CuratorStudio} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </SiteLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
