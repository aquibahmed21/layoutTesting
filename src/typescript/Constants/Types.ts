export interface Member
{
  id: string;
  clientData?: any;
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