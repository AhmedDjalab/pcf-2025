/* eslint-disable react-hooks/rules-of-hooks */
//@ts-nocheck
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, {
  forwardRef,
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

registerLocale("ar", arLocale);
registerLocale("en", enLocale);
registerLocale("es", esLocale);
registerLocale("de", deLocale);
registerLocale("fr", frLocale);
interface ResourceType {
  name: string;
  avatar: string;
  title?: string;
}

const weekendDays = ["Sat", "Sun"];

const resources: ResourceType[] = [
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
  const [resourcesList, setResourcesList] = useState<ResourceType[]>(resources);
  const [searchResource, setSearchResource] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language is English ("en")
  const [leaveDates, setLeaveDates] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Handle language change
  const handleLanguageChange = (event: any) => {
    setSelectedLanguage(event.target.value);
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  // Pass the selected language to the getDaysData function

  let daysOfWeek = getDaysData(selectedDate, selectedLanguage);
  useEffect(() => {
    daysOfWeek = getDaysData(selectedDate, selectedLanguage);
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    setIsTodayinMonth((prev: boolean) => (prev = isToday));
  }, [selectedDate, selectedLanguage]);
  useEffect(() => {
    if (!searchResource) {
      setResourcesList(resources);
      return;
    }

    let newResources = resources.filter((resource) =>
      resource.name.toLowerCase().includes(searchResource.toLowerCase())
    );
    setResourcesList((prev) => (prev = newResources));
  }, [searchResource, resourcesList]);
  useEffect(() => {
    const className = "dark";
    const bodyClass = window.document.body.classList;

    isDarkMode ? bodyClass.add(className) : bodyClass.remove(className);
  }, [isDarkMode]);
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
        {/* for resources  */}

        {/* for calander  */}

        {/* Timeline days  */}
        <div className="flex overflow-x-auto dark:text-white dark:bg-slate-900">
          <Timeline
            daysOfWeek={daysOfWeek}
            resourcesLength={resourcesList.length - 1}
            resourcesList={resourcesList}
            searchResource={searchResource}
            setSearchResource={setSearchResource}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isTodayinMonth={isTodayinMonth}
            selectedLanguage={selectedLanguage}
          />
        </div>
      </div>
    </div>
  );
};

export default Shedular;

interface TimelineProps {
  resourcesLength: number;
  daysOfWeek: { day: number; dayOfWeek: string; isToday: boolean }[];
  resourcesList: ResourceType[];
  searchResource: any;
  setSearchResource: any;
  selectedDate: any;
  setSelectedDate: any;
  isTodayinMonth: any;
  selectedLanguage?: string;
}
const Timeline: React.FC<TimelineProps> = ({
  daysOfWeek,
  resourcesLength,
  resourcesList,
  searchResource,
  setSearchResource,
  selectedDate,
  setSelectedDate,
  isTodayinMonth,
  selectedLanguage,
}) => {
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
  // Create refs for both sections
  const resourcesRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const cellRefs: React.MutableRefObject<(HTMLDivElement | null)[]> = useRef(
    []
  );

  // State to track the scroll positions of both sections
  const [resourcesScrollTop, setResourcesScrollTop] = useState(0);
  const [calendarScrollTop, setCalendarScrollTop] = useState(0);

  // Event handler to update the scroll positions
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    if (event.currentTarget === resourcesRef.current) {
      setResourcesScrollTop(scrollTop);
      if (calendarRef.current) {
        calendarRef.current.scrollTop = scrollTop;
      }
    } else if (event.currentTarget === calendarRef.current) {
      setCalendarScrollTop(scrollTop);
      if (resourcesRef.current) {
        resourcesRef.current.scrollTop = scrollTop;
      }
    }
  };

  // Add scroll event listeners to both sections
  useEffect(() => {
    if (resourcesRef.current) {
      resourcesRef.current.addEventListener("scroll", handleScroll);
    }
    if (calendarRef.current) {
      calendarRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (resourcesRef.current) {
        resourcesRef.current.removeEventListener("scroll", handleScroll);
      }
      if (calendarRef.current) {
        calendarRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const decreaseMonth = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setMonth(currentDate.getMonth() - 1);
    setSelectedDate(currentDate);
  };

  const increaseMonth = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setMonth(currentDate.getMonth() + 1);
    setSelectedDate(currentDate);
  };
  // Generate cell ID based on resource ID and day number
  const generateCellId = (
    resourceId: number,
    dayOfWeek: string,
    month: number,
    year: number
  ) => `${resourceId}-${dayOfWeek}-${month}-${year}`;

  const currentMonth = selectedDate.getMonth() + 1; // Months are 0-indexed, so we add 1.
  const currentYear = selectedDate.getFullYear();

  // Function to create an array of events with single days
  const createSingleDayEvents = (events) => {
    const singleDayEventsMap = new Map();

    events.forEach((event) => {
      const { start, end, resource, ...rest } = event;
      const currentDay = new Date(start);

      while (currentDay <= end) {
        const eventId = generateCellId(
          resource,
          currentDay.getDate(),
          currentDay.getMonth() + 1,
          currentDay.getFullYear()
        );
        const singleDayEvent = {
          ...rest,
          start: new Date(currentDay),
          end: new Date(currentDay),
          resource: resource,
          id: eventId, // Assign a new ID for each single-day event
        };

        //singleDayEvents.push(singleDayEvent);
        singleDayEventsMap.set(eventId, singleDayEvent);
        currentDay.setDate(currentDay.getDate() + 1); // Move to the next day
      }
    });

    return singleDayEventsMap;
  };

  // Usage
  const myEventsData = useMemo(() => {
    // Your original events array
    // ...

    const singleDayEvents = createSingleDayEvents(myEvents);

    return singleDayEvents;
  }, []);

  // Function to get the resource index in the grid
  const getResourceIndex = (resourceId) => {
    const resourceIndex = resourcesList.findIndex(
      (resource) => resource.id === resourceId
    );
    return resourceIndex + 1; // Adding 1 because the first row is used for header
  };

  // Function to get the day index in the grid
  const getDayIndex = (day) => {
    const dayIndex = daysOfWeek.findIndex((dayData) => dayData.day === day);
    return dayIndex + 1; // Adding 1 because the first column is used for resources
  };

  return (
    <div className=" flex ">
      {/* //! Resources Pannel */}
      <div
        className="flex min-w-[290px] 
			 bg-red  border-r-2 border-[#dbe5ec]"
      >
        <div ref={resourcesRef} className=" w-full overflow-y-scroll">
          <div className="flex items-center flex-col justify-between bg-white  sticky top-0 dark:text-white dark:bg-slate-900">
            <div className="flex w-full px-8 justify-between">
              <div>
                <p>Emoloyess </p>
                <p>
                  {resourcesList.length - 1 < 0 ? 0 : resourcesList.length - 1}
                  of
                  {resourcesList.length - 1 < 0 ? 0 : resourcesList.length - 1}
                </p>
              </div>
              <div>
                <p
                  onClick={() => setSearchResource("")}
                  className="cursor-pointer text-[#0db5df] font-medium"
                >
                  ClearAll
                </p>
              </div>
            </div>

            <div
              key={"whitespace"}
              className="items-center border-b
							  flex h-[52px] pl-4 w-full
							 border-[#dbe5ec]   "
            >
              <Search
                className={`text-heading 
                cursor-pointer -rotate-180 rounded-mddark:text-white dark:bg-slate-900 `}
              />
              <input
                className="outline-none focus:ring-0 hover:ring-0 text-md dark:text-white dark:bg-slate-900"
                value={searchResource}
                onChange={(e) => setSearchResource(e.target.value)}
              />
            </div>
          </div>

          {/* list of resources  */}
          <ul className="p-0 m-0 list-none">
            {resourcesList.map(({ avatar, name, title }, index) => (
              <li
                key={index}
                className="items-center border-b
							  flex h-[52px] pl-4
							 border-[#dbe5ec]"
              >
                <a
                  href="#"
                  className="inline-flex p-0 text-black bg-none dark:text-white dark:bg-slate-900"
                >
                  <img
                    src={avatar}
                    alt={name}
                    className="rounded-full w-[40px] h-[40px] mr-4 "
                  />
                  <div className="mt-0 mb-0">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-sm text-grey">{title}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* //? calander Module  */}
      <div ref={calendarRef} className="flex flex-col overflow-y-scroll">
        {/* //!header */}
        <div
          className="flex   z-13 min-h-[50px]
				 pl-4  items-center gap-2 w-[100%] bg-[#F4F7F9] dark:text-white dark:bg-slate-900
				"
        >
          <div className="flex items-center gap-2   dark:text-white dark:bg-slate-900">
            <button
              className="flex items-center justify-center cursor-pointer "
              onClick={decreaseMonth}
            >
              <ArrowRight
                className={`text-heading 
                cursor-pointer -rotate-180 rounded-md `}
              />
            </button>
            <button
              className="flex items-center justify-center cursor-pointer "
              onClick={increaseMonth}
            >
              <ArrowRight
                className={`text-heading 
                cursor-pointer rounded-md `}
              />
            </button>
          </div>
          <DataAndMonthPicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedLanguage={selectedLanguage}
          />

          {!isTodayinMonth && (
            <button
              className="text-[#0db5df] text-sm font-medium ml-6"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </button>
          )}
        </div>
        <div
          className="grid  w-full h-full relative dark:text-white dark:bg-slate-900"
          style={{
            gridTemplateColumns: `repeat(${daysOfWeek.length}, minmax(100px, 1fr))`,
            gridTemplateRows: `repeat(${resourcesLength}, 52px)`,
            gridAutoFlow: "column",
          }}
        >
          {daysOfWeek.map(({ day, dayOfWeek, isToday }, index) => {
            return (
              <React.Fragment key={index}>
                <div
                  key={index}
                  className=" flex flex-col 
            items-center justify-center  border-b
             border-gray-300  p-2 px-2  sticky  bg-[#F4F7F9]
              top-0 dark:text-white dark:bg-slate-900
             "
                  style={{
                    gridArea: `1 / ${day} / span 1 / span 1`,
                    color: isToday ? "#0db5df" : undefined,
                    boxShadow: isToday ? "inset 0 -4px 0 0 #0db5df" : undefined,
                  }}
                >
                  <p className="text-sm">{day}</p>
                  <p className="text-sm">{dayOfWeek}</p>
                </div>
              </React.Fragment>
            );
          })}

          {/* {resources.map((resource, resourceIndex) => {
            return (
              <React.Fragment key={resource.id}>
                {daysOfWeek.map(({ day, dayOfWeek, isToday }, index) => {
                  const cellId = generateCellId(
                    resource.id,
                    day,
                    currentMonth,
                    currentYear
                  );
                  // console.warn(
                  //   "🚀 ~ file: Shedular.tsx:505 ~ {daysOfWeek.map ~ cellId:",
                  //   cellId
                  // );

                  return (
                    <div
                      key={cellId}
                      style={{
                        backgroundImage: weekendDays.includes(dayOfWeek)
                          ? "linear-gradient(#dbe5ec 1px,#f4f7f9 0)"
                          : "linear-gradient(#dbe5ec 1px,transparent 0)",
                        backgroundPosition: "-1px -1px",
                        backgroundSize: " 52px 52px",
                        borderBottom: "1px solid #dbe5ec",
                        borderRight: "1px solid #dbe5ec",

                        gridArea: `${resource.id}
                         /  ${day} / span 1 / span 1`,
                      }}
                    >
                      {console.log(
                        "this is data ",
                        myEventsData.get(cellId),
                        cellId
                      )}
                      {myEventsData.get(cellId) && (
                        <div
                          style={{
                            backgroundColor: myEventsData.get(cellId).color,
                            padding: "8px",
                            zIndex: 10,
                          }}
                        >
                          {myEventsData.get(cellId).title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })} */}

          {resources.map((resource, resourceIndex) => {
            return (
              <React.Fragment key={resource.id}>
                {/* <div
                  className="flex items-center justify-end border-r border-gray-300 p-2 pr-4 bg-[#F4F7F9] sticky left-0"
                  style={{
                    gridArea: `${resourceIndex + 2} / 1 / span 1 / span 1`, // +2 to account for the header row
                  }}
                >
                  <img
                    src={resource.avatar}
                    alt={resource.name}
                    className="rounded-full w-[40px] h-[40px] mr-4"
                  />
                  <div>
                    <p className="text-sm font-semibold">{resource.name}</p>
                    <p className="text-sm text-gray-500">{resource.title}</p>
                  </div>
                </div> */}
                {daysOfWeek.map(({ day, dayOfWeek }, index) => {
                  const cellId = generateCellId(
                    resource.id,
                    day,
                    currentMonth,
                    currentYear
                  );

                  return (
                    <div
                      key={cellId}
                      style={{
                        backgroundImage: weekendDays.includes(dayOfWeek)
                          ? "linear-gradient(#dbe5ec 1px,#f4f7f9 0) "
                          : "linear-gradient(#dbe5ec 1px,transparent 0) ",
                        backgroundPosition: "-1px -1px",
                        backgroundSize: " 52px 52px",
                        borderBottom: "1px solid #dbe5ec",
                        borderRight: "1px solid #dbe5ec",
                        gridArea: `${resourceIndex + 2} / ${
                          index + 1
                        } / span 1 / span 1`,
                      }}
                    >
                      {myEventsData.get(cellId) && (
                        <div
                          style={{
                            backgroundColor: myEventsData.get(cellId).color,
                            padding: "8px",
                            zIndex: 10,
                            textAlign: "center",
                            borderRadius: "10px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Add box shadow here
                          }}
                        >
                          {myEventsData.get(cellId).title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
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

interface IDateAndMonthPicker {
  selectedDate: any;
  setSelectedDate: any;
  selectedLanguage?: string;
}
const DataAndMonthPicker = ({
  selectedDate,
  setSelectedDate,
  selectedLanguage,
}: IDateAndMonthPicker) => {
  const formatDate = (date: any) => {
    return date.toLocaleString(selectedLanguage ?? "en", { month: "long" });
  };
  const CustomInput = ({ value, onClick }: any) => (
    <p onClick={onClick}>{value}</p>
  );

  return (
    <DatePicker
      locale={selectedLanguage ?? "en"}
      className="dark:text-white dark:bg-slate-900"
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      showMonthYearPicker
      dateFormat="MMMM  yyyy"
      customInput={<CustomInput value={moment(selectedDate).format("MMMM")} />}
    />
  );
};
