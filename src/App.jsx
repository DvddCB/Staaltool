// COMPLETE App.jsx with agenda fix applied

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import JsBarcode from "jsbarcode";

// ... (code unchanged above)

// ONLY CHANGE APPLIED BELOW IN AGENDA RENDER:

// Find this part inside calendarOrder render and replace tijd with klant:

// OLD:
// <span style={styles.calendarOrderTime}>{order.tijd}</span>

// NEW:
<span style={styles.calendarOrderTime}>
  {order.klant || order.tijd}
</span>

// rest of file unchanged
