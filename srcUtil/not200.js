class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.response = response;
    }
}

export const not200 = response => {
    if (response.status === 200) {
        return response;
    } else {
        throw new HttpError(response);
    }
};
