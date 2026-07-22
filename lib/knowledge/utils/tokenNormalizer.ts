export function normalizeTokens(
  text: string
): string[] {

  const cleanedText =
    text
      .toLowerCase()
      .replace(/[.,;:!?]/g, "");


  const tokens =
    cleanedText
      .split(/\s+/)
      .filter(
        token =>
          token.length > 0
      );


  return tokens.map(
    token => {

      if (token.endsWith("ies")) {
        return token.slice(0, -3) + "y";
      }


      if (
        token.endsWith("s") &&
        !token.endsWith("ss")
      ) {
        return token.slice(0, -1);
      }


      return token;
    }
  );
}