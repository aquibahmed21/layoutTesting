import { DroneService } from "./DroneService";
import { UI } from "./UI";
import { Base } from "./Utils/Base";
import { Util } from "./Utils/Util";

export class App extends Base
{
  constructor()
  {
    super();
    this.UI = new UI();
    this.m_RootElement = this.GetElementByID(Util.ELEMENT_APP);
    this.SetupEvents();
  }

  private SetupEvents():
  void
  {
    const connectBtn = this.FindByID(this.m_RootElement, App.s_connectBtn) as HTMLButtonElement;
    if (connectBtn)
      connectBtn.addEventListener(Util.EVENT_CLICK, () => this.Connect());
  }

  private Connect():
  void
  {
    const channel = (this.FindByID(this.m_RootElement, App.s_channel) as HTMLInputElement).value || Util.CHANNEL_ID;
    const room = (this.FindByID(this.m_RootElement, App.s_room) as HTMLInputElement).value || Util.ROOM_NAME;

    this.m_droneService = new DroneService(channel, room, (members) => this.UI.UpdateContacts(members));
    this.m_droneService.Connect();
  }

  private UI: UI;
  private m_RootElement: HTMLElement | null = null;
  private m_droneService: DroneService | null = null;

  private static readonly s_connectBtn = "connectBtn";
  private static readonly s_channel = "channel";
  private static readonly s_room = "room";
}
