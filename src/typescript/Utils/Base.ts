export class Base
{
  /**
   * Returns the first matching element by ID from document
   */
  public GetElementByID(id: string):
  HTMLElement | null
  {
    return document.getElementById(id);
  }

  /**
   * Finds an element by ID within a given parent element
   */
  public FindByID<T extends HTMLElement>(parent: T | null,
                                         id: string):
  T | null
  {
    if (!parent) return null;
    return parent.querySelector(`#${id}`) as T;
  }

  /**
   * Utility wrapper for creating elements
   */
  public CreateElement(tag: string,
                       className?: string,
                       text?: string):
  HTMLElement
  {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  /**
   * Utility to add event listeners safely
   */
  public On(el: HTMLElement | null,
            event: string,
            callback: (e: Event) => void):
  void
  {
    if (el) el.addEventListener(event, callback);
  }
}
