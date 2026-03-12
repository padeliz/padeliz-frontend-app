import * as Colors from "./Colors";

export const FONT_REGULAR = 'Inter_400Regular';
export const FONT_MEDIUM  = 'Inter_500Medium';
export const FONT_BOLD    = 'Inter_700Bold';
export const NAME = FONT_REGULAR; // backwards compat alias

export const SCREEN_TITLE = 22;
export const HEADING_1 = 24;
export const HEADING_2 = 20;
export const HEADING_3 = 18;

export const BODY = 16;
export const BODY_S = 14;
export const BODY_XS = 12;

export const BOLD = 700;
export const MEDIUM = 500;
export const REGULAR = 400;

export const BOLD_STYLE = {
    color: Colors.WHITE,
    fontFamily: NAME,
    fontSize: BODY,
    fontWeight: MEDIUM,
};

export const REGULAR_STYLE = {
    color: Colors.WHITE,
    fontFamily: NAME,
    fontSize: BODY_S,
    fontWeight: REGULAR,
};