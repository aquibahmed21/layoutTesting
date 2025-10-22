(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Util {
  // Common DOM events
  static EVENT_CLICK = "click";
  static EVENT_DOM_CONTENT_LOADED = "DOMContentLoaded";
  // Common attribute names
  static ATTR_ID = "id";
  static ATTR_CLASS = "class";
  static ATTR_DATA = "data-";
  // Common element selectors
  static ELEMENT_APP = "app";
  // ScaleDrone constants
  static CHANNEL_ID = "EoIG3R1I4JdyS4L1";
  static ROOM_NAME = "observable-e7b2d4";
  static StopPropagation(event) {
    if (!event) return;
    event.stopPropagation();
    event.preventDefault();
  }
  static StoreUserCredentials(username, password, name, status) {
    if (!username || !password || !name || !status) return false;
    localStorage.setItem("credentials", btoa(`${username}:${password}:${name}:${status}:${Date.now()}`));
    return true;
  }
  static VerifyUserCredentials(username, password) {
    if (!username || !password) return false;
    const credentials = localStorage.getItem("credentials");
    if (!credentials) return false;
    const decodedCredentials = atob(credentials);
    const [storedUsername, storedPassword] = decodedCredentials.split(":");
    return storedUsername === username && storedPassword === password;
  }
  static GetUserDetails() {
    const credentials = localStorage.getItem("credentials");
    if (!credentials) return null;
    const decodedCredentials = atob(credentials);
    const [username, password, name, status, id] = decodedCredentials.split(":");
    console.log({ password });
    return { username, name, status, id };
  }
  static IsUserCredentialsStored() {
    return localStorage.getItem("credentials") !== null;
  }
  static ClearUserCredentials() {
    localStorage.removeItem("credentials");
  }
}
const MSG_LOGS = {
  // Drone Service Messages
  DRONE_CONNECTED: "Connected to Scaledrone",
  DRONE_DISCONNECTED: "Disconnected from Scaledrone",
  DRONE_CONNECTION_FAILED: "Scaledrone connection failed",
  ROOM_SUBSCRIPTION_FAILED: "Failed to subscribe to room"
};
const MSG_PUBLISH_TYPES = {
  POKE: "poke"
};
const MSG = {
  UNKNOWN: "Unknown message"
};
class DroneService {
  constructor(channelID, roomName) {
    this.m_channelId = channelID;
    this.m_roomName = roomName;
  }
  async Connect(name, status, username, id) {
    return await new Promise((resolve) => {
      this.m_drone = new window.Scaledrone(this.m_channelId, { data: { name, status, username, id } });
      this.m_drone.on(DroneService.EVENT_OPEN, () => {
        console.log(MSG_LOGS.DRONE_CONNECTED, this.m_drone?.clientId);
        this.SubscribeToRoom();
        resolve(true);
      });
      this.m_drone.on(DroneService.EVENT_ERROR, (error) => {
        console.error(MSG_LOGS.DRONE_CONNECTION_FAILED, error);
        resolve(false);
      });
      this.m_drone.on(DroneService.EVENT_CLOSE, () => {
        console.log(MSG_LOGS.DRONE_DISCONNECTED);
      });
    });
  }
  Disconnect() {
    if (!this.m_drone) return;
    this.m_drone.close();
  }
  SubscribeToRoom(roomName = this.m_roomName) {
    if (!this.m_drone) return;
    const room = this.m_drone.subscribe(roomName);
    room.on(DroneService.EVENT_OPEN, (error) => {
      if (error) console.error(MSG_LOGS.ROOM_SUBSCRIPTION_FAILED, error);
    });
    room.on(DroneService.EVENT_MEMBERS, (members) => {
      members.forEach((member) => {
        this.m_members = this.m_members.filter((m) => m.id !== member.id);
        member.clientData.state = 1;
        member.clientData.timestamp = Date.now();
        member.clientData.lastMessage = "Hello + " + Date.now();
        this.m_members.push(member);
      });
      this.m_membersUpdateCallback(this.m_members);
    });
    room.on(DroneService.EVENT_MEMBER_JOIN, (member) => {
      this.m_members = this.m_members.filter((m) => m.id !== member.id);
      member.clientData.state = 1;
      member.clientData.timestamp = Date.now();
      member.clientData.lastMessage = "Hello + " + Date.now();
      this.m_members.push(member);
      this.m_membersUpdateCallback(this.m_members);
    });
    room.on(DroneService.EVENT_MEMBER_LEAVE, (member) => {
      this.m_members = this.m_members.filter((m) => m.id !== member.id);
      member.clientData.state = 0;
      member.clientData.timestamp = Date.now();
      member.clientData.lastMessage = "Bye + " + Date.now();
      this.m_members.push(member);
      this.m_membersUpdateCallback(this.m_members);
    });
    room.on(DroneService.EVENT_MESSAGE, this.HandleEventMessage.bind(this));
  }
  HandleEventMessage(message) {
    const { data } = message;
    if (data) {
      const { type } = data;
      switch (type) {
        case MSG_PUBLISH_TYPES.POKE:
          console.log(data);
          break;
        default:
          console.log(MSG.UNKNOWN + " type", type);
      }
    } else {
      console.log(MSG.UNKNOWN, message);
    }
  }
  Publish(data) {
    if (!this.m_drone) return;
    this.m_drone.publish({ data });
  }
  set onMembersUpdate(callback) {
    this.m_membersUpdateCallback = callback;
  }
  m_drone = {};
  m_members = [];
  m_channelId;
  m_roomName;
  m_membersUpdateCallback = null;
  static EVENT_OPEN = "open";
  static EVENT_ERROR = "error";
  static EVENT_CLOSE = "close";
  static EVENT_MESSAGE = "message";
  static EVENT_MEMBERS = "members";
  static EVENT_MEMBER_JOIN = "member_join";
  static EVENT_MEMBER_LEAVE = "member_leave";
}
class Base {
  constructor(drone) {
    if (!Base.RootElement)
      Base.RootElement = document.getElementById(Util.ELEMENT_APP);
    Base.dynamicID = "div" + this.constructor.name;
    if (drone)
      this.m_droneService = drone;
    this.Load();
  }
  /**
   * Returns the first matching element by ID from document
   */
  GetElementByID(id) {
    return Base.RootElement.querySelector(`#${id}`);
  }
  /**
   * Finds an element by ID within a given parent element
   */
  FindByID(parent, id) {
    if (!parent)
      return null;
    return parent?.querySelector(`#${id}`);
  }
  FindByClass(parent, className) {
    return parent.querySelector(`.${className}`);
  }
  get m_divContainer() {
    return this.FindByClass(Base.RootElement, Base.dynamicID);
  }
  GetDisplayTime(timeSent, includeSeconds = false) {
    if (timeSent <= 0)
      return "--";
    let dateTimeSent = new Date(timeSent);
    let date = dateTimeSent.getDate();
    let month = dateTimeSent.getMonth();
    let day = dateTimeSent.getDay();
    let dayPart = Base.CALENDAR_DAYS[day];
    let fullYear = dateTimeSent.getFullYear();
    let hours = dateTimeSent.getHours();
    let hour = hours % 12;
    let am_pm = hours >= 12 ? "pm" : "am";
    let minutes = dateTimeSent.getMinutes();
    let seconds = dateTimeSent.getSeconds();
    let actualTime = ("00" + hour).slice(-2) + ":" + ("00" + minutes).slice(-2);
    if (includeSeconds) {
      actualTime += ":" + ("00" + seconds).slice(-2);
    }
    let timePart = actualTime + " " + am_pm;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthName = monthNames[month];
    let dayMonthPart = ("00" + date).slice(-2) + "-" + monthName;
    let today = /* @__PURE__ */ new Date();
    let todayFullYear = today.getFullYear();
    let todayMonth = today.getMonth();
    let todayDate = today.getDate();
    let todayDay = today.getDay();
    let time = date > todayDate ? date - todayDate : todayDate - date;
    if (fullYear == todayFullYear && month == todayMonth && date == todayDate)
      return timePart;
    if (fullYear == todayFullYear && month == todayMonth && todayDate - date == 1)
      return "Y'day, " + timePart;
    if (fullYear == todayFullYear && month == todayMonth && day != todayDay && time <= 7)
      return dayMonthPart + ", " + dayPart + ", " + timePart;
    if (fullYear == todayFullYear && month == todayMonth && date == todayDate)
      return timePart;
    if (fullYear == todayFullYear)
      return dayMonthPart + ", " + timePart;
    dayMonthPart += "-" + fullYear;
    return dayMonthPart + ", " + timePart;
  }
  static dynamicID = "";
  static RootElement;
  m_droneService = null;
  static CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
}
class Contacts extends Base {
  constructor(drone) {
    super(drone);
  }
  Load() {
    this.m_droneService.onMembersUpdate = this.HandleMembersUpdates.bind(this);
    this.m_divContainer.classList.remove("Util_hide");
    this.m_header = this.GetElementByID("header");
    this.m_header.classList.remove("Util_hide");
  }
  HandleMembersUpdates(members) {
    this.m_header = this.GetElementByID("header");
    const credentials = Util.GetUserDetails();
    if (!credentials)
      return;
    const { id: selfID, username: selfUsername } = credentials;
    const contactList = this.FindByID(this.m_divContainer, "divContactsList");
    members.forEach((member) => {
      if (member.clientData) {
        const { name, status, id, username, state, timestamp, lastMessage, profileID } = member.clientData;
        console.log({ name, status, id, username, state, timestamp, lastMessage, profileID });
        if (id === selfID && username === selfUsername) {
          this.FindByID(this.m_header, "name").textContent = name;
          this.FindByID(this.m_header, "status").textContent = status;
        } else {
          const rowID = `contact-row-${id}`;
          let child = this.FindByID(contactList, rowID);
          if (!child) {
            const template = this.GetElementByID("contact-template");
            child = template.content.cloneNode(true).children[0];
            contactList.appendChild(child);
            child.id = rowID;
          }
          this.FindByClass(child, "contact-name").textContent = name;
          this.FindByClass(child, "last-seen").textContent = "Last seen: " + this.GetDisplayTime(timestamp);
          this.FindByClass(child, "contact-last-message").textContent = lastMessage;
          this.FindByClass(child, "contact-status-dot").classList.add(state === 1 ? "online" : "offline");
        }
      }
    });
  }
  m_header;
}
class Logins extends Base {
  constructor() {
    super();
  }
  async Load() {
    if (Util.IsUserCredentialsStored() && await this.LoginUser()) return;
    this.m_divContainer.addEventListener(Util.EVENT_CLICK, this.OnClick_divLoginContainer.bind(this));
  }
  async OnClick_divLoginContainer(event) {
    Util.StopPropagation(event);
    const targetID = event.target.id;
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
        const username = this.FindByID(this.m_divContainer, "username").value.toString().trim();
        const password = this.FindByID(this.m_divContainer, "password").value.toString().trim();
        if (Util.VerifyUserCredentials(username, password))
          await this.LoginUser();
        else {
          alert("Invalid Credentials!");
        }
        break;
      case "register":
        const regUsername = this.FindByID(this.m_divContainer, "username").value.toString().trim();
        const regPassword = this.FindByID(this.m_divContainer, "password").value.toString().trim();
        const regName = this.FindByID(this.m_divContainer, "name").value.toString().trim();
        const regStatus = this.FindByID(this.m_divContainer, "status").value.toString().trim();
        if (Util.StoreUserCredentials(regUsername, regPassword, regName, regStatus))
          alert("Registration Successful! You can now login.");
        else {
          alert("Registration Failed! Please fill all fields.");
          return;
        }
        this.FindByID(this.m_divContainer, "loginTab").classList.add("active");
        this.FindByID(this.m_divContainer, "registerTab").classList.remove("active");
        this.FindByID(this.m_divContainer, "login").classList.remove("Util_hide");
        this.FindByID(this.m_divContainer, "register").classList.add("Util_hide");
        this.FindByID(this.m_divContainer, "name").classList.add("Util_hide");
        this.FindByID(this.m_divContainer, "status").classList.add("Util_hide");
        break;
    }
  }
  async LoginUser() {
    const user = Util.GetUserDetails();
    if (!user) {
      alert("User details not found!");
      return false;
    }
    const container = this.m_divContainer;
    const { username, name, status, id } = user;
    this.m_droneService = new DroneService(Util.CHANNEL_ID, Util.ROOM_NAME);
    if (await this.m_droneService.Connect(name, status, username, id)) {
      container.classList.add("Util_hide");
      new Contacts(this.m_droneService);
      return true;
    }
    return false;
  }
}
class UI extends Base {
  constructor() {
    super();
  }
  Load() {
    new Logins();
  }
}
class App extends Base {
  constructor() {
    super();
  }
  Load() {
    new UI();
  }
}
console.trace("App initializing...");
document.addEventListener(Util.EVENT_DOM_CONTENT_LOADED, () => {
  new App();
});
