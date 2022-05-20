const urlModel = require("../models/urlModel")
const shortid = require('shortid');
const redis = require("redis");
const { promisify } = require("util");


/*******************************************************************Redis Connection************************************************************/

const redisClient = redis.createClient(
    14961,
    "redis-14961.c264.ap-south-1-1.ec2.cloud.redislabs.com", { no_ready_check: true }
);
redisClient.auth("pzpNsbz1lxgvWQSwUalsr2wt4YvjYcy5", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Redis is Connected!!!");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

/*************************************************************************************************************************************************/

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
/*****************************************************************Creating Short URL*************************************************************/

const shortUrl = async function (req, res) {
    try {

        if (!Object.keys(req.body).length)return res.status(400).send({ status: false, message: "Please provide URL details" }); 
        
        if (!isValid(req.body.longUrl))return res.status(400).send({ status: false, message: "Please provide Long URL." });
        
        if (!/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(req.body.longUrl)){ /*URL validation*/
        return res.status(400).send({ status: false, message: "Please Provide a Valid Long URL." })}

        const cachedlongUrl = await GET_ASYNC(`${req.body.longUrl}`); 

        const parsedUrl=JSON.parse(cachedlongUrl)

        if (parsedUrl) return res.status(200).send(cachedlongUrl);       /*Checking Data From Cache */

        const checkLongUrl = await urlModel.findOne({ longUrl: req.body.longUrl }).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0 }); /*Checking Data From urlModel */

        if (checkLongUrl) {
            await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(checkLongUrl));
         res.status(200).send({ status: true, message: `Short URL already generated for this longURL.`, data: checkLongUrl });
        return
    }

        const shortCode = shortid.generate()
        const baseUrl = "http://localhost:3000";
        const shortUrl = baseUrl + "/" + shortCode;  /*Concat base baseURL & URLcode*/

        const ShortenUrl = await urlModel.create({ longUrl: req.body.longUrl , shortUrl: shortUrl, urlCode: shortCode, }).select({ createdAt: 0, updatedAt: 0, __v: 0 });
        
        await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(ShortenUrl));

        return res.status(201).send({ status: true, message: `Successfully Shorten the URL`, data: ShortenUrl, });

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}


/***************************************************************Redirect to Original Url**********************************************************/

const originalUrl = async function (req, res) {

    try {
        
        if (!shortid.isValid(`${req.params.urlCode}`)) return res.status(400).send({ status: false, message: "Please provide Correct urlCode." }); /*Checking Data From Cache */

        let cachedShortId = await GET_ASYNC(`${req.params.urlCode}`);

        let parsedShortId=JSON.parse(cachedShortId)

        if (parsedShortId) return res.status(302).redirect(parsedShortId.longUrl); /*Checking Data From Cache */
        
        const originalUrlData = await urlModel.findOne({ urlCode: req.params.urlCode });
       
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(originalUrlData));

        if (originalUrlData) {
            return res.status(302).redirect(originalUrlData.longUrl);
        } else {
            return res.status(404).send({ status: false, msg: "No URL Found" });
        }

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}



module.exports = { shortUrl, originalUrl }
