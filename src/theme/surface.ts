import { createContext, useContext } from "react";

/**
 * Indica se i componenti stanno renderizzando sopra una superficie SCURA
 * (es. schermate auth con <ScreenContainer dark>). I componenti di base
 * (TextField, ecc.) lo leggono per scegliere colori di testo leggibili,
 * senza dover passare props a ogni chiamata.
 */
export const OnDarkContext = createContext(false);

export const useOnDark = () => useContext(OnDarkContext);
