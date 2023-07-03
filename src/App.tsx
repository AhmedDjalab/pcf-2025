import {
  Eventcalendar,
  MbscCalendarEvent,
  MbscEventcalendarView,
  MbscResource,
} from "@mobiscroll/react";
import React from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import Shedular from "./Shedular";

const App: React.FC = () => {
  const inv = [
    {
      recurring: {
        repeat: "weekly",
        weekDays: "SA,SU",
      },
    },
  ];
  const view = React.useMemo<MbscEventcalendarView>(() => {
    return {
      timeline: {
        type: "month",
        eventList: true,
      },
    };
  }, []);

  const myEvents = React.useMemo<MbscCalendarEvent[]>(() => {
    return [
      {
        start: "2023-06-02T00:00",
        end: "2023-06-02T23:00",
        title: "CC",
        resource: 1,
        tooltip: " ",
      },
      {
        start: "2023-06-09T09:00",
        end: "2023-06-09T15:00",
        title: "TT",
        resource: 3,
      },
      {
        start: "2023-06-12T00:00",
        end: "2023-06-12T00:00",
        title: "CC",
        resource: 1,
      },
    ];
  }, []);

  const myResources = React.useMemo<MbscResource[]>(() => {
    return [
      {
        id: 1,
        name: "Djaalab Ahmed ",
        color: "#e20000",
      },
      {
        id: 2,
        name: "Hamza",
        color: "#76e083",
      },
      {
        id: 3,
        name: "Gharbi",
        color: "#4981d6",
      },
      {
        id: 4,
        name: "Mohamed",
        color: "#e25dd2",
      },
      {
        id: 5,
        name: "Karim",
        color: "#1dab2f",
      },
      {
        id: 6,
        name: "Yacine",
        color: "#d6d145",
      },
      {
        id: 7,
        name: "React ",
        color: "#34c8e0",
      },
      {
        id: 8,
        name: "Yamen",
        color: "#9dde46",
      },
    ];
  }, []);

  return <Shedular />;
};
export default App;

/*!SECTION

1 - I needed for my time line compoent about employee shift 

2- I am still in markting phase in 1 year i think my customer will be no more than 10 , 
3- there is package callled react-timeline-calender , so I use it , but i think your is better in performance 

4  - yes , i am still on early stage , so there is no profit yet , 

*/
