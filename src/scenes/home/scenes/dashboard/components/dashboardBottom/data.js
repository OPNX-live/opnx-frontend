import {intl} from "utils/Language";
export function tradingType(status) {
    let type = status;
    if (typeof status === "object") {
        type = status[0];
    }
    if (type === "INVERSE_BTC") {
        return "Inverse-BTC";
    } else if (type === "INVERSE_ETH") {
        return intl("Inverse");
    } else if (type === "LINEAR") {
        return intl("Linear-USD");
    } else if (type === "TRADING") {
        return "Trading";
    } else {
        return type;
    }
}

export function tfaType(type) {
    switch (type) {
        case "AUTHY_SECRET":
        case "AUTHY_PHONE":
            return "Authy";
        case "GOOGLE":
            return "Google Auth";
        case "YUBIKEY":
            return "YubiKey";
        default:
            return type;
    }
}