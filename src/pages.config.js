/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Affirmations from './pages/Affirmations';
import AgentChat from './pages/AgentChat';
import Appointments from './pages/Appointments';
import CalorieTracker from './pages/CalorieTracker';
import Diagnostics from './pages/Diagnostics';
import Finance from './pages/Finance';
import Fitness from './pages/Fitness';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import Home from './pages/Home';
import Journal from './pages/Journal';
import ManifestationBoard from './pages/ManifestationBoard';
import Onboarding from './pages/Onboarding';
import Premium from './pages/Premium';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Splash from './pages/Splash';
import Terms from './pages/Terms';
import TodoList from './pages/TodoList';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Affirmations": Affirmations,
    "AgentChat": AgentChat,
    "Appointments": Appointments,
    "CalorieTracker": CalorieTracker,
    "Diagnostics": Diagnostics,
    "Finance": Finance,
    "Fitness": Fitness,
    "Goals": Goals,
    "Habits": Habits,
    "Home": Home,
    "Journal": Journal,
    "ManifestationBoard": ManifestationBoard,
    "Onboarding": Onboarding,
    "Premium": Premium,
    "Privacy": Privacy,
    "Profile": Profile,
    "Settings": Settings,
    "Splash": Splash,
    "Terms": Terms,
    "TodoList": TodoList,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};