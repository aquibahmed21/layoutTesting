import { Util } from "../Constants/Util";
import { DroneService } from "../DroneService";
import { Contacts } from "./Contacts";
import * as Page from "./../Constants/_Export";

export class Logins extends Page.Base
{
  constructor()
  {
    super();
  }

  protected async Load():
  Promise<void>
  {
    if (Util.IsUserCredentialsStored() && await this.LoginUser()) return;
    this.m_divContainer.addEventListener(Util.EVENT_CLICK, this.OnClick_divLoginContainer.bind(this) as any);
  }

  private async OnClick_divLoginContainer(event: MouseEvent):
  Promise<void>
  {
    Util.StopPropagation(event);
    const targetID = (event.target as HTMLElement).id;
    switch (targetID) {
      case "loginTab":
        this.FindByID(this.m_divContainer, "loginTab").classList.add("active");
        this.FindByID(this.m_divContainer, "registerTab").classList.remove("active");
        this.FindByID(this.m_divContainer, "login").classList.remove("Util_hide");
        this.FindByID(this.m_divContainer, "register").classList.add("Util_hide");
        this.FindByID(this.m_divContainer, "name").classList.add("Util_hide");
        this.FindByID(this.m_divContainer, "status").classList.add("Util_hide");
        break;
      case "registerTab":
        this.FindByID(this.m_divContainer, "loginTab").classList.remove("active");
        this.FindByID(this.m_divContainer, "registerTab").classList.add("active");
        this.FindByID(this.m_divContainer, "login").classList.add("Util_hide");
        this.FindByID(this.m_divContainer, "register").classList.remove("Util_hide");
        this.FindByID(this.m_divContainer, "name").classList.remove("Util_hide");
        this.FindByID(this.m_divContainer, "status").classList.remove("Util_hide");
        break;
      case "login":
        const username = this.FindByID<HTMLInputElement>(this.m_divContainer, "username").value.toString().trim();
        const password = this.FindByID<HTMLInputElement>(this.m_divContainer, "password").value.toString().trim();
        if (Util.VerifyUserCredentials(username, password))
          await this.LoginUser();
        else {
          alert("Invalid Credentials!");
        }
        break;
      case "register":
        const regUsername = this.FindByID<HTMLInputElement>(this.m_divContainer, "username").value.toString().trim();
        const regPassword = this.FindByID<HTMLInputElement>(this.m_divContainer, "password").value.toString().trim();
        const regName = this.FindByID<HTMLInputElement>(this.m_divContainer, "name").value.toString().trim();
        const regStatus = this.FindByID<HTMLInputElement>(this.m_divContainer, "status").value.toString().trim();
        if (Util.StoreUserCredentials(regUsername, regPassword, regName, regStatus))
          alert("Registration Successful! You can now login.");
        else
        {
          alert("Registration Failed! Please fill all fields.");
          return;
        }
        // Switch to login tab after registration
        this.FindByID(this.m_divContainer, "loginTab").classList.add("active");
        this.FindByID(this.m_divContainer, "registerTab").classList.remove("active");
        this.FindByID(this.m_divContainer, "login").classList.remove("Util_hide");
        this.FindByID(this.m_divContainer, "register").classList.add("Util_hide");
        this.FindByID(this.m_divContainer, "name").classList.add("Util_hide");
        this.FindByID(this.m_divContainer, "status").classList.add("Util_hide");
        break;
      default:
        break;
    }
  }

  private async LoginUser ():
  Promise<boolean>
  {
    const user = Util.GetUserDetails();
    if (!user) {
      alert("User details not found!");
      return false;
    }

    const container = this.m_divContainer;
    const { username, name, status, id } = user;
    this.m_droneService = new DroneService(Util.CHANNEL_ID, Util.ROOM_NAME);
    if (await this.m_droneService.Connect(name, status, username, id))
    {
      container.classList.add("Util_hide");
      new Contacts(this.m_droneService);
      return true;
    }
    return false;
  }
}