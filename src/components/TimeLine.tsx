/* eslint-disable react-hooks/exhaustive-deps */
//@ts-noCheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ReactComponent as ArrowRight } from "../../src/assets/Icons/Basic/Arrow-Right 1.svg";
import { ResourceType } from "../Shedular";
import { ReactComponent as Search } from "../../src/assets/Icons/Basic/Search.svg";
import { DataAndMonthPicker } from "./DateAndMonthPicker";

interface TimelineProps {
  resourcesLength: number;
  daysOfWeek: { day: number; dayOfWeek: string; isToday: boolean }[];
  resourcesList: ResourceType[];
  searchResource: any;
  setSearchResource?: any;
  handleSearchResource?: any;
  selectedDate: any;
  setSelectedDate: any;
  isTodayinMonth: any;
  selectedLanguage?: string;
  weekendDays?: string[];
  myEvents: any[];
}
export const Timeline: React.FC<TimelineProps> = ({
  daysOfWeek,
  resourcesLength,
  resourcesList,
  searchResource,
  setSearchResource,
  selectedDate,
  setSelectedDate,
  isTodayinMonth,
  selectedLanguage,
  weekendDays,
  handleSearchResource,
  myEvents,
}) => {
  // Create refs for both sections
  const resourcesRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

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
  }, [resourcesRef.current, calendarRef.current]);

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
  const createSingleDayEvents = (events: any) => {
    const singleDayEventsMap = new Map();

    events.forEach((event: any) => {
      const { start, end, resource, ...rest } = event;
      const currentDay = new Date(start);

      while (currentDay <= end) {
        const eventId = generateCellId(
          resource,
          currentDay.getDate().toString(),
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
  }, [myEvents]);

  // Function to get the resource index in the grid
  const calendarGridRef = useRef<HTMLDivElement>(null);

  const updateGridTemplateRows = () => {
    if (calendarGridRef.current) {
      const grid = calendarGridRef.current;
      const gridTemplateRows = `repeat(${resourcesList.length + 1}, 52px)`;
      grid.style.gridTemplateRows = gridTemplateRows;
    }
  };

  useEffect(() => {
    updateGridTemplateRows();
  }, [resourcesList.length]);
  //   useEffect(() => {
  //     const gridElement = calendarGridRef.current;

  //     if (gridElement) {
  //       const gridTemplateColumns = `repeat(${daysOfWeek.length}, minmax(100px, 1fr))`;
  //       const gridTemplateRows = `repeat(${resourcesList.length - 1}, 52px)`;

  //       console.warn(
  //         "🚀 ~ file: Shedular.tsx:519 ~ useLayoutEffect ~ resourcesLength:",
  //         resourcesLength
  //       );
  //       gridElement.style.gridTemplateColumns = gridTemplateColumns;
  //       gridElement.style.gridTemplateRows = gridTemplateRows;
  //     }
  //   }, [daysOfWeek.length, resourcesLength, calendarGridRef.current]);

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
                onChange={(e) => {
                  setSearchResource(e.target.value);
                }}
              />
            </div>
          </div>

          {/* list of resources  */}
          <ul className="p-0 m-0 list-none">
            {resourcesList.map(({ id, avatar, name, title }, index) => (
              <li
                key={id}
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
          ref={calendarGridRef}
          className="grid  w-full h-full relative dark:text-white dark:bg-slate-900"
          style={{
            gridTemplateColumns: `repeat(${daysOfWeek.length}, minmax(100px, 1fr))`,
            gridTemplateRows: `repeat(${resourcesList.length}, 52px)`,
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

          {resourcesList.map((resource, resourceIndex) => {
            return (
              <React.Fragment key={resource.id}>
                {daysOfWeek.map(({ day, dayOfWeek }, index) => {
                  const cellId = generateCellId(
                    resource.id,
                    day.toString(),
                    currentMonth,
                    currentYear
                  );

                  return (
                    <div
                      key={cellId}
                      style={{
                        backgroundImage: weekendDays!.includes(dayOfWeek)
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
