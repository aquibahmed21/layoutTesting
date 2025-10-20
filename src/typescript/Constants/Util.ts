
export class Util
{
  // Common DOM events
  public static readonly EVENT_CLICK = "click";
  public static readonly EVENT_DOM_CONTENT_LOADED = "DOMContentLoaded";

  // Common attribute names
  public static readonly ATTR_ID = "id";
  public static readonly ATTR_CLASS = "class";
  public static readonly ATTR_DATA = "data-";

  // Common element selectors
  public static readonly ELEMENT_APP = "app";

  // ScaleDrone constants
  public static readonly CHANNEL_ID = "EoIG3R1I4JdyS4L1";
  public static readonly ROOM_NAME = "observable-e7b2d4";

  public static StopPropagation(event: Event):
  void
  {
    if (!event) return;
    event.stopPropagation();
    event.preventDefault();
  }

  public static StoreUserCredentials(username: string, password: string, name: string, status: string):
  boolean
  {
    if (!username || !password || !name || !status) return false;
    localStorage.setItem("credentials", btoa(`${username}:${password}:${name}:${status}:${Date.now()}`));
    return true;
  }

  public static VerifyUserCredentials(username: string, password: string):
  boolean
  {
    if (!username || !password) return false;
    const credentials = localStorage.getItem("credentials")
    if (!credentials) return false;
    const decodedCredentials = atob(credentials);
    const [storedUsername, storedPassword] = decodedCredentials.split(":");
    return storedUsername === username && storedPassword === password;
  }

  public static GetUserDetails():
  { username: string; name: string; status: string, id: string} | null
  {
    const credentials = localStorage.getItem("credentials");
    if (!credentials) return null;
    const decodedCredentials = atob(credentials);
    const [username, password, name, status, id] = decodedCredentials.split(":");
    console.log({password})
    return { username, name, status, id };
  }

  public static IsUserCredentialsStored():
  boolean
  {
    return localStorage.getItem("credentials") !== null;
  }

  public static ClearUserCredentials():
  void
  {
    localStorage.removeItem("credentials");
  }
}
