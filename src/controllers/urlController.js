const urlModel = require("../models/urlModel")
const shortid = require('shortid');

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

/***********************************************************************************************************************/
const shortUrl = async function (req, res) {
    const data = req.body

    if (!Object.keys(data).length) {
        return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide URL details" });
    }
    if (!isValid(data.longUrl)) {
        return res.status(400).send({ status: false, message: "Please provide Long URL." });
    }
    const longUrlLowerCase = data.longUrl
    //checking long URL from DB
    const checkLongUrl = await urlModel.findOne({ longUrl: longUrlLowerCase }).select({ createdAt: 0, updatedAt: 0, __v: 0 ,_id:0});
    if (checkLongUrl) {
        return res.status(200).send({ status: true, message: `Short URL already generated for this longURL.`, data: checkLongUrl });
    }

    const shortCode = shortid.generate()
    const baseUrl = "http://localhost:3000";

    const shortUrl = baseUrl + "/" + shortCode; //concatenating base URL & URL code

    const ShortenUrl = await urlModel.create({ longUrl: longUrlLowerCase, shortUrl: shortUrl, urlCode: shortCode, });

    return res.status(201).send({ status: true, message: `Successfully Shorten the URL`, data: ShortenUrl, });
}
/***********************************************************************************************************************/
const originalUrl = async function (req, res) {

    let shortId = req.params.urlCode;

    if(!shortid.isValid(shortId))return res.status(400).send({ status: false, message: "Please provide Correct urlCode." });
    
    const originalUrlData = await urlModel.findOne({urlCode: shortId});
    
    if (originalUrlData) {
        return res.redirect(307, originalUrlData.longUrl);
      } else {
        return res.status(404).send({ status: false, msg: "No URL Found" });
      }
    
}

module.exports = { shortUrl, originalUrl }