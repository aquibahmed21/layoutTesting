
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

  private static dynamicID = "";
  public static RootElement: HTMLElement;
  public m_droneService: DroneService = null as any;
}
