
import { Util } from "../Constants/Util";
import type { DroneService } from "../DroneService";

export abstract class Base
{
  constructor(drone?: DroneService)
  {
    if (!Base.RootElement)
      Base.RootElement = document.getElementById(Util.ELEMENT_APP)!;
    Base.dynamicID = "div" + this.constructor.name;
    if (drone)
      this.m_droneService = drone;
    this.Load();
  }

  protected abstract Load(): void;
  /**
   * Returns the first matching element by ID from document
   */
  public GetElementByID<T extends HTMLElement>(id: string):
  T
  {
    return Base.RootElement.querySelector(`#${id}`) as T;
  }

  /**
   * Finds an element by ID within a given parent element
   */
  public FindByID<T extends HTMLElement>(parent: HTMLDivElement | HTMLElement,
                                         id: string):
  T
  {
    if (!parent)
      return null as any;
    return parent?.querySelector(`#${id}`) as T;
  }

  public FindByClass<T extends HTMLElement>(parent: HTMLDivElement | HTMLElement,
                                            className: string):
  T
  {
    return parent.querySelector(`.${className}`) as T;
  }

  public get m_divContainer():
  HTMLDivElement
  {
    return this.FindByClass(Base.RootElement, Base.dynamicID);
  }

    public GetDisplayTime (timeSent: number, includeSeconds: boolean = false):
  string
  {
    if(timeSent <= 0)
      return "--";

    // Time received/sent
    let dateTimeSent = new Date(timeSent);
    let date = dateTimeSent.getDate();
    let month = dateTimeSent.getMonth();
    let day = dateTimeSent.getDay();
    let dayPart = Base.CALENDAR_DAYS[day]; // https://stackoverflow.com/q/54741141/514235
    let fullYear = dateTimeSent.getFullYear();

    let hours = dateTimeSent.getHours();
    let hour =  hours % 12;
    let am_pm = hours >= 12? "pm" : "am";
    let minutes = dateTimeSent.getMinutes();
    let seconds = dateTimeSent.getSeconds();
    let actualTime = ("00" + hour).slice(-2) + ":" + ("00" + minutes).slice(-2);
    if (includeSeconds) {
      actualTime += ":" + ("00" + seconds).slice(-2);
    }
    let timePart = actualTime + " " + am_pm;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthName = monthNames[month];
    let dayMonthPart = ("00" + date).slice(-2) + "-" + monthName;

    // Today's date
    let today = new Date();
    let todayFullYear = today.getFullYear();
    let todayMonth = today.getMonth();
    let todayDate = today.getDate();
    let todayDay = today.getDay();
    let time = (date > todayDate)? date - todayDate : todayDate - date;

    if(fullYear == todayFullYear && month == todayMonth && date == todayDate)
      return timePart;

    if(fullYear == todayFullYear && month == todayMonth && todayDate - date == 1)
      return "Y'day" + ", " + timePart;

    if(fullYear == todayFullYear && month == todayMonth && day != todayDay && time <= 7)
      return dayMonthPart + ", " + dayPart + ", " + timePart;

    // To check if it's same day/date
    if(fullYear == todayFullYear && month == todayMonth && date == todayDate)
      return timePart;

    if(fullYear == todayFullYear)
      return dayMonthPart + ", " + timePart;

    dayMonthPart += "-" + fullYear; // Append the year if it's not the same as the current year

    return dayMonthPart + ", " + timePart;
  }

  private static dynamicID = "";
  public static RootElement: HTMLElement;
  public m_droneService: DroneService = null as any;

  private static readonly CALENDAR_DAYS = ["Sun","Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
}
