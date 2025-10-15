
import { type Member } from "./Utils/Types";

export class DroneService
{
  constructor(channelId: string,
              roomName: string,
              onMembersUpdate: (members: Member[]) => void)
  {
    this.m_channelId = channelId;
    this.m_roomName = roomName;
    this.onMembersUpdate = onMembersUpdate;
  }

  public Connect():
  void
  {
    this.m_drone = new (window as any).Scaledrone(this.m_channelId, { data: { name: `User-${Math.floor(Math.random() * 1000)}` } });

    this.m_drone.on("open", (error: Error) =>
    {
      if (error)
      {
        console.error("Scaledrone connection failed:", error);
        return;
      }
      console.log("Connected to Scaledrone as:", this.m_drone?.clientId);
      this.SubscribeToRoom();
    });
  }

  private SubscribeToRoom():
  void
  {
    if (!this.m_drone) return;
    const room = this.m_drone.subscribe(this.m_roomName);

    room.on("open", (error: Error) => {
      if (error) console.error("Room subscription error:", error);
    });

    room.on("members", (members: Member[]) => {
      this.m_members = members;
      this.onMembersUpdate(this.m_members);
    });

    room.on("member_join", (member: Member) => {
      this.m_members.push(member);
      this.onMembersUpdate(this.m_members);
    });

    room.on("member_leave", (member: Member) => {
      this.m_members = this.m_members.filter((m) => m.id !== member.id);
      this.onMembersUpdate(this.m_members);
    });
  }


  private m_drone: any = null;
  private m_members: Member[] = [];
  private m_channelId: string;
  private m_roomName: string;
  private onMembersUpdate: (members: Member[]) => void;
}
