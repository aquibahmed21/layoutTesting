import { App } from "./App";
import { Util } from "./Constants/Util";

console.trace("App initializing...");


document.addEventListener(Util.EVENT_DOM_CONTENT_LOADED, () =>
{
  new App();
});

