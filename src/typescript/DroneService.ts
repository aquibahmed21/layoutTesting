
import { MSG, MSG_LOGS, MSG_PUBLISH_TYPES } from "./Constants/Messages";
import { type Member, type ScaleDrone } from "./Constants/Types";

export class DroneService
{
  constructor(channelID: string,
              roomName: string,
              onMembersUpdate: (members: Member[]) => void)
  {
    this.m_channelId = channelID;
    this.m_roomName = roomName;
    this.onMembersUpdate = onMembersUpdate;
  }

  public Connect():
  void
  {
    this.m_drone = new (window as any).Scaledrone(this.m_channelId, { data: { name: `User-${Math.floor(Math.random() * 1000)}` } });

    this.m_drone.on(DroneService.EVENT_OPEN, () =>
    {
      console.log(MSG_LOGS.DRONE_CONNECTED, this.m_drone?.clientId);
      this.SubscribeToRoom();
    });

    this.m_drone.on(DroneService.EVENT_ERROR, (error: Error) => {
      console.error(MSG_LOGS.DRONE_CONNECTION_FAILED, error);
    });

    this.m_drone.on(DroneService.EVENT_CLOSE, () => {
      console.log(MSG_LOGS.DRONE_DISCONNECTED);
    });
  }

  public Disconnect():
  void
  {
    if (!this.m_drone) return;
    this.m_drone.close();
  }

  private SubscribeToRoom(roomName = this.m_roomName):
  void
  {
    if (!this.m_drone) return;
    const room = this.m_drone.subscribe(roomName);

    room.on(DroneService.EVENT_OPEN, (error: Error) => {
      if (error) console.error(MSG_LOGS.ROOM_SUBSCRIPTION_FAILED, error);
    });

    room.on(DroneService.EVENT_MEMBERS, (members: Member[]) => {
      this.m_members = members;
      this.onMembersUpdate(this.m_members);
    });

    room.on(DroneService.EVENT_MEMBER_JOIN, (member: Member) => {
      this.m_members.push(member);
      this.onMembersUpdate(this.m_members);
    });

    room.on(DroneService.EVENT_MEMBER_LEAVE, (member: Member) => {
      this.m_members = this.m_members.filter((m) => m.id !== member.id);
      this.onMembersUpdate(this.m_members);
    });

    room.on(DroneService.EVENT_MESSAGE, this.HandleEventMessage.bind(this));
  }

  private HandleEventMessage (message: any):
  void
  {
    const {data} = message;
    if (data)
    {
      const {type} = data;
      switch (type)
      {
        case MSG_PUBLISH_TYPES.POKE: console.log(data); break;
        default: console.log(MSG.UNKNOWN + " type", type);
      }
    }
    else
    {
      console.log(MSG.UNKNOWN, message);
    }
  }

  public Publish(data: any):
  void
  {
    if (!this.m_drone) return;
    this.m_drone.publish({ data });
  }

  private m_drone: ScaleDrone = {} as ScaleDrone;
  private m_members: Member[] = [];
  private m_channelId: string;
  private m_roomName: string;
  private onMembersUpdate: (members: Member[]) => void;

  private static readonly EVENT_OPEN = "open";
  private static readonly EVENT_ERROR = "error";
  private static readonly EVENT_CLOSE = "close";
  private static readonly EVENT_MESSAGE = "message";
  private static readonly EVENT_MEMBERS = "members";
  private static readonly EVENT_MEMBER_JOIN = "member_join";
  private static readonly EVENT_MEMBER_LEAVE = "member_leave";
}
