import type { Member } from "../Constants/Types";
import type { DroneService } from "../DroneService";
import * as Page from "./../Constants/_Export";

export class Contacts extends Page.Base
{
  constructor(drone: DroneService)
  {
    super(drone);
  }

  protected Load():
  void
  {
    this.m_droneService.onMembersUpdate = this.HandleMembersUpdates.bind(this);
    this.m_divContainer.classList.remove("Util_hide");
    this.m_header = this.GetElementByID<HTMLHeadElement>("header");

    this.m_header.classList.remove("Util_hide")
  }

  private HandleMembersUpdates(members: Member[]):
  void
  {
    this.m_header = this.GetElementByID<HTMLHeadElement>("header");
    const credentials = Page.Util.GetUserDetails();
    if (!credentials)
      return;

    const { id: selfID, username: selfUsername } = credentials;
    const contactList = this.FindByID(this.m_divContainer, "divContactsList");
    members.forEach((member: Member) =>
    {
      if (member.clientData)
      {
        const { name, status, id, username, state, timestamp, lastMessage, profileID } = member.clientData;
        console.log({name, status, id, username, state, timestamp, lastMessage, profileID});
        if (id === selfID && username === selfUsername)
        {
          this.FindByID<HTMLSpanElement>(this.m_header, "name").textContent = name;
          this.FindByID<HTMLSpanElement>(this.m_header, "status").textContent = status;
        }
        else
        {
          const rowID = `contact-row-${id}`;
          let child = this.FindByID<HTMLDivElement>(contactList, rowID);
          if (!child)
          {
            const template = this.GetElementByID<HTMLTemplateElement>("contact-template");
            child = (template.content.cloneNode(true) as HTMLElement).children[0] as HTMLDivElement;
            contactList.appendChild(child);
            child.id = rowID;
          }

          // this.FindByID<HTMLImageElement>(clone, "contact-avatar").src = member.avatar;
          this.FindByClass<HTMLDivElement>(child, "contact-name").textContent = name;
          this.FindByClass<HTMLDivElement>(child, "last-seen").textContent = "Last seen: " + this.GetDisplayTime(timestamp);
          this.FindByClass<HTMLDivElement>(child, "contact-last-message").textContent = lastMessage;
          this.FindByClass<HTMLDivElement>(child, "contact-status-dot").classList.add(state === 1 ? "online" : "offline");
        }
      }
    });
  }

  private m_header!: HTMLHeadElement
}