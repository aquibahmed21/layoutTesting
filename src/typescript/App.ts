import { UI } from "./UI";
import * as Page from "./Constants/_Export";

export class App extends Page.Base
{
  constructor()
  {
    super();
  }

  protected Load():
  void
  {
    new UI();
  }
}
