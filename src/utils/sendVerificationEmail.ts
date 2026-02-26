import i18next from "i18next";
import { mailSender } from "./mailSender.js";

export const sendVerificationEmail = async (email: string, otp: string, name: string, userLang: string) => {
  const t = (key: string) => i18next.t(key, { lng: userLang });

  console.log("userLang:", userLang);

  const html = `
 <table style="background:#4A64FD; padding:30px 0; font-family:Arial" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center">
                        <table style="border-radius:15px; background:#FFF; padding:30px 30px;" width="600" cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center" style="font-size:24px; font-weight:bold; color:#2E334E; padding-bottom:30px;">
                                    ${t("email.welcome")}${name}!
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-bottom:30px;">
                                    <table style="letter-spacing:3px; border-radius:10px; background:#4A64FD; padding:12px 0;" cellpadding="0" cellspacing="0" width="130px">
                                        <tr>
                                            <td align="center" style="font-size:20px; font-weight:bold; color:#fff;"
                                                >${otp}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="center"  style="font-size:14px; color:#2E334E; padding:5px 0;">
                                    ${t("email.copyCode")}
                                </td>
                            </tr>
                          <tr>
                                <td align="center"  style="font-size:14px; color:#2E334E;">
                                  ${t("email.ignoreIfNotYou")}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
  `;
  await mailSender(email, t("email.subject"), html);
};
