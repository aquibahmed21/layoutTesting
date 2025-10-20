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

    members.forEach((member: Member) =>
    {
      if (member.clientData)
      {
        const { name, status, id, username } = member.clientData;
        console.log({name, status, id, username});
        if (id === selfID && username === selfUsername)
        {
          this.FindByID<HTMLSpanElement>(this.m_header, "name").textContent = name;
          this.FindByID<HTMLSpanElement>(this.m_header, "status").textContent = status;
        }
        else
        {

        }
      }
    });
  }

  private m_header!: HTMLHeadElement
}