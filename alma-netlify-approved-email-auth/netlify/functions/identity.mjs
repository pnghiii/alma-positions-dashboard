import { isAllowedEmail } from "./_lib/allowed-emails.mjs";

export default {
    userValidate(event) {
        if (!isAllowedEmail(event.user.email)) {
            return event.deny();
        }
    },

    userLogin(event) {
        if (!isAllowedEmail(event.user.email)) {
            return event.deny();
        }
    }
};
