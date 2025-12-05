import Splash from './pages/Splash';
import Home from './pages/Home';
import ManifestationBoard from './pages/ManifestationBoard';
import Affirmations from './pages/Affirmations';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import Finance from './pages/Finance';
import Fitness from './pages/Fitness';
import Diet from './pages/Diet';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import CalorieTracker from './pages/CalorieTracker';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Splash": Splash,
    "Home": Home,
    "ManifestationBoard": ManifestationBoard,
    "Affirmations": Affirmations,
    "Goals": Goals,
    "Habits": Habits,
    "Finance": Finance,
    "Fitness": Fitness,
    "Diet": Diet,
    "Appointments": Appointments,
    "Settings": Settings,
    "CalorieTracker": CalorieTracker,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};