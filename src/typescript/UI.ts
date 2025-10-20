

import { Logins } from "./Pages/Logins";
import { Base } from "./Utils/Base";

export class UI extends Base
{
  constructor()
  {
    super();
  }

  protected Load():
  void
  {
    // Initialize all Pages from here
    new Logins();
    // new Contacts();
  }
}
