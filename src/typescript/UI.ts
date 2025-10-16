import type { Member } from "./Constants/Types";

export class UI
{
  constructor()
  {
    this.m_contactsEl = document.getElementById("contacts")!;
  }

  public UpdateContacts(members: Member[])
  {
    this.m_contactsEl.innerHTML = "";
    members.forEach((m) => {
      const div = document.createElement("div");
      div.className = "contact";
      div.textContent = m.clientData?.name || m.id;
      this.m_contactsEl.appendChild(div);
    });
  }

  private m_contactsEl: HTMLElement;
}
