export const getLocationParams = () => {
    const params = window.location.search.split("?")[1];
    if (!params) return;
    const result = params && params.split("&");
    const res =
        result &&
        Object.assign(
            {},
            Object.fromEntries(
                result.map((p) => {
                    return p.split("=");
                })
            )
        );
    return res;
};
