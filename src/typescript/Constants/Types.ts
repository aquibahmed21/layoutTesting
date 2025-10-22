export interface Member
{
  id: string;
  clientData: ClientData;
}

export interface ClientData
{
  name: string;
  status: string;
  username: string;
  id: string;
  state: 0 | 1;
  timestamp: number;
  lastMessage: string;
  profileID: string;
}

export interface ScaleDrone
{
  clientId: string;
  on(event: string, callback: (data: any) => void): void;
  subscribe(roomName: string): Room;
  close(): void;
  publish(data: any): void;
}

export interface Room
{
  on(event: string, callback: (data: any) => void): void;
}