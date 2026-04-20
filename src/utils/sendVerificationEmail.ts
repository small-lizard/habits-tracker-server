import i18next from "i18next";
import { mailSender } from "./mailSender.js";

export const sendVerificationEmail = async (email: string, otp: string, name: string, userLang: string) => {
  const t = (key: string) => i18next.t(key, { lng: userLang });
const html = `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#4A64FD; padding:30px 0; font-family:Arial; margin:0;">
  <tr>
    <td align="center">
      <table 
        width="100%" 
        cellpadding="0" 
        cellspacing="0" 
        style="max-width:600px; width:100%; background:#FFFFFF !important; border-radius:15px; padding:30px; box-sizing:border-box;" 
        bgcolor="#FFFFFF"
      >
        <tr>
          <td align="center" style="font-size:24px; font-weight:bold; color:#2E334E; padding-bottom:30px;">
            ${t("email.welcome")}${name}!
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:30px;">
            <table 
              width="100%" 
              cellpadding="0" 
              cellspacing="0" 
              style="max-width:130px; width:100%; background:#4A64FD; border-radius:10px; padding:12px; box-sizing:border-box; letter-spacing:3px;" 
              bgcolor="#4A64FD"
            >
              <tr>
                <td align="center" style="font-size:20px; font-weight:bold; color:#fff;">
                  ${otp}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="font-size:14px; color:#2E334E; padding:5px 0;">
            ${t("email.copyCode")}
          </td>
        </tr>
        <tr>
          <td align="center" style="font-size:14px; color:#2E334E;">
            ${t("email.ignoreIfNotYou")}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
`;
  await mailSender(email, t("email.subject"), html);
};
