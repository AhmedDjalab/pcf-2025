import AppRoutes from "./Route";
import { Provider } from "react-redux";
import { store } from "./state";
import { UserProvider } from "./context/UserContext";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

// import { BrowserRouter, Route, RouterProvider, Routes } from "react-router-dom";
let persistor = persistStore(store);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

// const App: React.FC = () => {
//   const inv = [
//     {
//       recurring: {
//         repeat: "weekly",
//         weekDays: "SA,SU",
//       },
//     },
//   ];
//   const view = React.useMemo<MbscEventcalendarView>(() => {
//     return {
//       timeline: {
//         type: "month",
//         eventList: true,
//       },
//     };
//   }, []);

//   const myEvents = React.useMemo<MbscCalendarEvent[]>(() => {
//     return [
//       {
//         start: "2023-06-02T00:00",
//         end: "2023-06-02T23:00",
//         title: "CC",
//         resource: 1,
//         tooltip: " ",
//       },
//       {
//         start: "2023-06-09T09:00",
//         end: "2023-06-09T15:00",
//         title: "TT",
//         resource: 3,
//       },
//       {
//         start: "2023-06-12T00:00",
//         end: "2023-06-12T00:00",
//         title: "CC",
//         resource: 1,
//       },
//     ];
//   }, []);

//   const myResources = React.useMemo<MbscResource[]>(() => {
//     return [
//       {
//         id: 1,
//         name: "Djaalab Ahmed ",
//         color: "#e20000",
//       },
//       {
//         id: 2,
//         name: "Hamza",
//         color: "#76e083",
//       },
//       {
//         id: 3,
//         name: "Gharbi",
//         color: "#4981d6",
//       },
//       {
//         id: 4,
//         name: "Mohamed",
//         color: "#e25dd2",
//       },
//       {
//         id: 5,
//         name: "Karim",
//         color: "#1dab2f",
//       },
//       {
//         id: 6,
//         name: "Yacine",
//         color: "#d6d145",
//       },
//       {
//         id: 7,
//         name: "React ",
//         color: "#34c8e0",
//       },
//       {
//         id: 8,
//         name: "Yamen",
//         color: "#9dde46",
//       },
//     ];
//   }, []);

// const data: ActivityData[] = [
//   {
//     ID: "ID1",
//     ActivityName: "Activity 1",
//     StartDate: "05/01/2024",
//     FinishDate: "05/01/2024",
//     StartChainage: 10200,
//     FinishChainage: 12200,
//     Shape: "line",
//   },
//   {
//     ID: "ID2",
//     ActivityName: "Activity 2",
//     StartDate: "05/01/2024",
//     FinishDate: "08/01/2024",
//     StartChainage: 12200,
//     FinishChainage: 16600,
//     Shape: "rect",
//   },
//   {
//     ID: "ID3",
//     ActivityName: "Activity 3",
//     StartDate: "08/01/2024",
//     FinishDate: "10/01/2024",
//     StartChainage: 16600,
//     FinishChainage: 17600,
//     Shape: "line",
//   },
//   {
//     ID: "ID4",
//     ActivityName: "Activity 4",
//     StartDate: "10/01/2024",
//     FinishDate: "12/01/2024",
//     StartChainage: 17600,
//     FinishChainage: 19600,
//     Shape: "triangle",
//   },
//   // Add more activities with different shapes
// ];

//   return (
//     <Provider store={store}>
//       <div className="App">
//         <DrawGraphForm />
//       </div>
//     </Provider>
//   );
// };
// export default App;

/*!SECTION

1 - I needed for my time line compoent about employee shift 

2- I am still in markting phase in 1 year i think my customer will be no more than 10 , 
3- there is package callled react-timeline-calender , so I use it , but i think your is better in performance 

4  - yes , i am still on early stage , so there is no profit yet , 

*/
