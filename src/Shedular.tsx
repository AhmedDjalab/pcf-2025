/* eslint-disable react-hooks/rules-of-hooks */
//@ts-nocheck
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DatePicker, { registerLocale } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import moment from "moment";
import { ReactComponent as ArrowRight } from "../src/assets/Icons/Basic/Arrow-Right 1.svg";
import { ReactComponent as Search } from "../src/assets/Icons/Basic/Search.svg";

import arLocale from "date-fns/locale/ar"; // Import the Arabic locale
import enLocale from "date-fns/locale/en-US"; // Import the Arabic locale
import esLocale from "date-fns/locale/es"; // Import the Arabic locale
import deLocale from "date-fns/locale/de"; // Import the Arabic locale
import frLocale from "date-fns/locale/fr"; // Import the Arabic locale

import ja from "date-fns/locale/ja";
import { Timeline } from "./components/TimeLine";

registerLocale("ar", arLocale);
registerLocale("en", enLocale);
registerLocale("es", esLocale);
registerLocale("de", deLocale);
registerLocale("fr", frLocale);
export interface ResourceType {
  name: string;
  avatar: string;
  title?: string;
  id: number;
}

// let weekendDays = ["Sat", "Sun"];

let resources: ResourceType[] = [
  {
    name: "Alice Adams",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Engineer",
    id: 1,
  },
  {
    name: "Bob Baker",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Graphic Designer",
    id: 2,
  },
  {
    name: "Carol Clark",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Marketing Specialist",
    id: 3,
  },
  {
    name: "David Davis",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Product Manager",
    id: 4,
  },
  {
    name: "Emma Evans",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Data Analyst",
    id: 5,
  },
  {
    name: "Frank Foster",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "UI/UX Designer",
    id: 6,
  },
  {
    name: "Grace Green",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Project Manager",
    id: 7,
  },
  {
    name: "Henry Harris",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Developer",
    id: 8,
  },
  {
    name: "Isabella Jackson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Marketing Manager",
    id: 9,
  },
  {
    name: "Jack Johnson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Frontend Developer",
    id: 10,
  },
  {
    name: "Kelly King",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Data Scientist",
    id: 11,
  },
  {
    name: "Luke Lee",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Business Analyst",
    id: 12,
  },
  {
    name: "Mia Mitchell",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Product Designer",
    id: 13,
  },
  {
    name: "Noah Nelson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Sales Manager",
    id: 14,
  },
  {
    name: "Olivia Olson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Backend Developer",
    id: 15,
  },
  {
    name: "Peter Peterson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Marketing Coordinator",
    id: 16,
  },
  {
    name: "Quinn Quinn",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Architect",
    id: 17,
  },
  {
    name: "Rachel Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "UX Researcher",
    id: 18,
  },
  {
    name: "Samuel Scott",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "IT Consultant",
    id: 19,
  },
  {
    name: "Taylor Thompson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Digital Marketer",
    id: 20,
  },
  {
    name: "Uma Underwood",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Engineer",
    id: 21,
  },
  {
    name: "Victor Vega",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Frontend Developer",
    id: 22,
  },
  {
    name: "Wendy White",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Data Analyst",
    id: 23,
  },
  {
    name: "Xavier Xavier",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "UI Designer",
    id: 24,
  },
  {
    name: "Yara Young",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Project Manager",
    id: 25,
  },
  {
    name: "Zoe Zimmerman",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Developer",
    id: 26,
  },
];

const Shedular = () => {
  const currentMonth = "June";

  const [selectedDate, setSelectedDate] = useState<any>(new Date());
  const [isTodayinMonth, setIsTodayinMonth] = useState<any>(true);
  const [filterdresourcesList, setResourcesList] =
    useState<ResourceType[]>(resources);
  const [searchResource, setSearchResource] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language is English ("en")
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [weekendDays, setWeekends] = useState(["Sat", "Sun"]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  // Handle language change
  const locales: any = {
    en: enLocale,
    ar: arLocale,
    es: esLocale,
    de: deLocale,
    fr: frLocale,
  };

  const myEvents = React.useMemo(() => {
    return [
      {
        start: new Date("2023-07-05T00:00"),
        end: new Date("2023-07-08T23:00"),
        title: "CC",
        resource: 1,
        tooltip: " ",
        color: "#ff55ff",
      },
      {
        start: new Date("2023-07-05T00:00"),
        end: new Date("2023-07-07T23:00"),
        title: "TT",
        resource: 3,
        color: "#241de9",
      },
      {
        start: new Date("2023-07-03T00:00"),
        end: new Date("2023-07-04T23:00"),
        title: "CC",
        resource: 5,
        color: "#ff55ff",
      },
      {
        start: new Date("2023-07-26T00:00"),
        end: new Date("2023-07-26T23:00"),
        title: "CC",
        resource: 26,
        color: "#ff55ff",
      },
      {
        start: new Date("2023-08-04T00:00"),
        end: new Date("2023-08-04T23:00"),
        title: "CC",
        resource: 2,
        color: "#ff55ff",
      },
    ];
  }, []);

  const getLocalizedDayName = useCallback(
    (dayNumber: number) => {
      return format(new Date(2023, 6, dayNumber), "EEE", {
        locale: locales[selectedLanguage],
      });
    },
    [selectedLanguage, locales]
  );

  useEffect(() => {
    const currentLanguageWeekendDays = [1, 2].map(getLocalizedDayName);
    setWeekends((prev) => {
      return currentLanguageWeekendDays.length === 2
        ? currentLanguageWeekendDays
        : ["Sat", "Sun"];
    });
  }, [selectedLanguage]);
  const handleLanguageChange = (event: any) => {
    setSelectedLanguage(event.target.value);
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    let daysOfWeek1 = getDaysData(selectedDate, selectedLanguage);
    setDaysOfWeek(daysOfWeek1);
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    setIsTodayinMonth((prev: boolean) => (prev = isToday));
  }, [selectedDate, selectedLanguage]);

  useEffect(() => {
    const className = "dark";
    const bodyClass = window.document.body.classList;

    isDarkMode ? bodyClass.add(className) : bodyClass.remove(className);
  }, [isDarkMode]);

  useEffect(() => {
    if (!searchResource) {
      setResourcesList(resources);
      return;
    }

    let newResources = resources.filter((resource) =>
      resource.name.toLowerCase().includes(searchResource.toLowerCase())
    );

    setResourcesList(newResources);
  }, [searchResource]);
  return (
    <div className={isDarkMode ? "dark:text-white dark:bg-slate-900" : ""}>
      <div className="text-center mt-4">
        <p className="text-lg font-bold">Developed with ❤️ by Ahmed Djalab</p>
        <a
          href="https://djaalabahmed.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Visit Official Site
        </a>
      </div>
      {/* Dark mode switcher */}
      <div className="flex items-center ml-4 mt-4">
        <p className="text-sm font-bold">Dark Mode:</p>
        <label className="switch ml-2">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <select
        value={selectedLanguage}
        onChange={handleLanguageChange}
        className="p-2 mt-2 ml-2 rounded-md dark:text-white dark:bg-slate-900"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">Germany</option>
      </select>

      <div
        className="flex  h-[600px]
      justify-start border bg-grey border-1  border-[#dbe5ec]"
      >
        <div className="flex overflow-x-auto dark:text-white dark:bg-slate-900">
          <Timeline
            daysOfWeek={daysOfWeek}
            resourcesLength={filterdresourcesList.length - 1}
            resourcesList={filterdresourcesList}
            searchResource={searchResource}
            setSearchResource={setSearchResource}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isTodayinMonth={isTodayinMonth}
            selectedLanguage={selectedLanguage}
            weekendDays={weekendDays}
            myEvents={myEvents}
          />
        </div>
      </div>
    </div>
  );
};

export default Shedular;

function getDaysData(date: Date, language: string) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  const today = new Date();

  for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
    const dayNumber = day.getDate();
    const dayOfWeek = day.toLocaleDateString(language, { weekday: "short" }); // Use the selected language for day names
    const isToday = day.toDateString() === today.toDateString();

    days.push({ day: dayNumber, dayOfWeek, isToday });
  }

  return days;
}
