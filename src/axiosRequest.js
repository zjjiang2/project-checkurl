const axios = require("axios");

function axiosRequest(siteName) {
    return(
    axios({
        method: "GET",
        url: siteName,
        setTimeout: 5000,
        validateStatus: () => true,
      })
    )
}

module.exports.axiosRequest = axiosRequest;