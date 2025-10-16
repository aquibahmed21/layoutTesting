// main.ts
import { App } from "./App";
import { Util } from "./Constants/Util";

document.addEventListener(Util.EVENT_DOM_CONTENT_LOADED, () => new App());
