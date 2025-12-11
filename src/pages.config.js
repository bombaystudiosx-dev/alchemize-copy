import Splash from './pages/Splash';
import Home from './pages/Home';
import ManifestationBoard from './pages/ManifestationBoard';
import Affirmations from './pages/Affirmations';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import Finance from './pages/Finance';
import Fitness from './pages/Fitness';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import CalorieTracker from './pages/CalorieTracker';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TodoList from './pages/TodoList';
import Journal from './pages/Journal';
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
    "Appointments": Appointments,
    "Settings": Settings,
    "CalorieTracker": CalorieTracker,
    "Terms": Terms,
    "Privacy": Privacy,
    "TodoList": TodoList,
    "Journal": Journal,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};