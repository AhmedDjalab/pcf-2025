/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import moment from "moment";
import { ReactComponent as ArrowRight } from "../src/assets/Icons/Basic/Arrow-Right 1.svg";
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
  },
  {
    name: "Bob Baker",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Graphic Designer",
  },
  {
    name: "Carol Clark",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Marketing Specialist",
  },
  {
    name: "David Davis",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Product Manager",
  },
  {
    name: "Emma Evans",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Data Analyst",
  },
  {
    name: "Frank Foster",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "UI/UX Designer",
  },
  {
    name: "Grace Green",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Project Manager",
  },
  {
    name: "Henry Harris",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Developer",
  },
  {
    name: "Isabella Jackson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Marketing Manager",
  },
  {
    name: "Jack Johnson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Frontend Developer",
  },
  {
    name: "Kelly King",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Data Scientist",
  },
  {
    name: "Luke Lee",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Business Analyst",
  },
  {
    name: "Mia Mitchell",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Product Designer",
  },
  {
    name: "Noah Nelson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Sales Manager",
  },
  {
    name: "Olivia Olson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Backend Developer",
  },
  {
    name: "Peter Peterson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Marketing Coordinator",
  },
  {
    name: "Quinn Quinn",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Architect",
  },
  {
    name: "Rachel Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "UX Researcher",
  },
  {
    name: "Samuel Scott",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "IT Consultant",
  },
  {
    name: "Taylor Thompson",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Digital Marketer",
  },
  {
    name: "Uma Underwood",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Engineer",
  },
  {
    name: "Victor Vega",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Frontend Developer",
  },
  {
    name: "Wendy White",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Data Analyst",
  },
  {
    name: "Xavier Xavier",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "UI Designer",
  },
  {
    name: "Yara Young",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Project Manager",
  },
  {
    name: "Zoe Zimmerman",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    title: "Software Developer",
  },
];

const Shedular = () => {
  const currentMonth = "June";

  const [selectedDate, setSelectedDate] = useState<any>(new Date());
  const [isTodayinMonth, setIsTodayinMonth] = useState<any>(true);
  let daysOfWeek = getDaysData(selectedDate);
  useEffect(() => {
    daysOfWeek = getDaysData(selectedDate);
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    setIsTodayinMonth((prev: boolean) => (prev = isToday));
  }, [selectedDate]);

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
  return (
    <div className="flex w-full justify-start border bg-grey border-1  border-[#dbe5ec]">
      {/* for resources  */}
      <div
        className="flex min-w-[290px] w-[290px]
			 bg-red min-h-[100%] border-r-2 border-[#dbe5ec]"
      >
        <div className="sticky w-full ">
          <div className="flex items-center justify-between px-8">
            <div>
              <p>Emoloyess </p>
              <p>
                {resources.length - 1} of {resources.length - 1}
              </p>
            </div>
            <div>
              <p>ClearAll</p>
            </div>
          </div>

          {/* list of resources  */}
          <ul className="p-0 m-0 list-none">
            <li
              key={"whitespace"}
              className="items-center border-b
							  flex h-[52px] pl-4
							 border-[#dbe5ec]"
            ></li>
            {resources.map(({ avatar, name, title }, index) => (
              <li
                key={index}
                className="items-center border-b
							  flex h-[52px] pl-4
							 border-[#dbe5ec]"
              >
                <a href="#" className="inline-flex p-0 text-black bg-none">
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
      {/* for calander  */}
      <div
        className="min-w-[840px] w-[100%] grid "
        style={{
          gridTemplateRows: "49px repeat(1, 1fr)",
        }}
      >
        {/* header */}
        <div
          className="flex   z-13 
				 pl-4  items-center gap-2 w-full bg-[#F4F7F9] 
				"
        >
          <div className="flex items-center gap-2   ">
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
        {/* Timeline days  */}
        <Timeline
          daysOfWeek={daysOfWeek}
          resourcesLength={resources.length - 1}
        />
      </div>
    </div>
  );
};

export default Shedular;

interface TimelineProps {
  resourcesLength: number;
  daysOfWeek: { day: number; dayOfWeek: string; isToday: boolean }[];
}
const Timeline: React.FC<TimelineProps> = ({ daysOfWeek, resourcesLength }) => {
  return (
    <div
      className="grid min-w-[840px] w-full overflow-x-scroll   "
      style={{
        gridTemplateColumns: `repeat(${daysOfWeek.length}, minmax(0, auto))`,
        gridTemplateRows: `repeat(${resourcesLength}, 52px)`,
        gridAutoFlow: "column",
      }}
    >
      {daysOfWeek.map(({ day, dayOfWeek, isToday }, index) => (
        <React.Fragment key={index}>
          <div
            className=" flex flex-col 
          items-center justify-center  border-b
           border-gray-300  p-2  sticky -top-10 bg-[#F4F7F9]"
            style={{
              gridArea: `1 / ${day} / span 1 / span 1`,
              color: isToday ? "#0db5df" : undefined,
              boxShadow: isToday ? "inset 0 -4px 0 0 #0db5df" : undefined,
            }}
          >
            <p className="text-sm">{day}</p>
            <p className="text-sm">{dayOfWeek}</p>
          </div>
          <div
            style={{
              backgroundImage: weekendDays.includes(dayOfWeek)
                ? "linear-gradient(#dbe5ec 1px,#f4f7f9 0)"
                : "linear-gradient(#dbe5ec 1px,transparent 0)",
              backgroundPosition: "-1px -1px",
              backgroundSize: " 52px 52px",
              borderBottom: "1px solid #dbe5ec",
              borderRight: "1px solid #dbe5ec",

              gridArea: `2 /  ${day} / span ${resourcesLength} / span 1`,
            }}
          ></div>
          {isToday && (
            <div
              style={{
                zIndex: "-1",
                backgroundColor: "#cff0f9",
                gridArea: `2 /  ${day} / span ${resourcesLength} / span 1`,
              }}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
function getDaysData(date: Date) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  const today = new Date();

  for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
    const dayNumber = day.getDate();
    const dayOfWeek = day.toLocaleDateString("en-US", { weekday: "short" });
    const isToday = day.toDateString() === today.toDateString();

    days.push({ day: dayNumber, dayOfWeek, isToday });
  }

  return days;
}

interface IDateAndMonthPicker {
  selectedDate: any;
  setSelectedDate: any;
}
const DataAndMonthPicker = ({
  selectedDate,
  setSelectedDate,
}: IDateAndMonthPicker) => {
  const formatDate = (date: any) => {
    return date.toLocaleString("default", { month: "long" });
  };
  const CustomInput = ({ value, onClick }: any) => (
    <p onClick={onClick}>{value}</p>
  );

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      showMonthYearPicker
      dateFormat="MMMM  yyyy"
      customInput={<CustomInput value={moment(selectedDate).format("MMMM")} />}
    />
  );
};
