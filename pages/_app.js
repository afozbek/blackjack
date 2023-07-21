/* eslint-disable react/prop-types */
import React from "react";

import "../styles/main.scss";

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
