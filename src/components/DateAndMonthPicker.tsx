import moment from "moment";
import DatePicker from "react-datepicker";

interface IDateAndMonthPicker {
  selectedDate: any;
  setSelectedDate: any;
  selectedLanguage?: string;
}
export const DataAndMonthPicker = ({
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
