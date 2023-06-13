import sql from 'connect-to-db';
import 'dotenv/config';
import express from 'express';
const app = express()
const port = 4000



const geoIpFields = [ip_range_start, ip_range_end, country_code, state1, state2, city, postcode, latitude, longitude, timezone];

function createGeoIpTableIfNotExists() {
    sql`
        CREATE TABLE IF NOT EXISTS geo_ip (
            ip_prefix TEXT PRIMARY KEY,
            country_code TEXT,
            state1 TEXT,
            state2 TEXT,
            city TEXT,
            postcode TEXT,
            latitude TEXT,
            longitude TEXT,
            timezone TEXT
        )
    `;
}


function importGeoIpCSVIntoDatabase(){
    // ip_range_start trimmed to first 3 parts of ip and ip_range_start should be renamed to ip_prefix
    // do not use ip_range_start or ip_range_end as a field in the output table
    const csvFilePath = path.join(__dirname, 'geoip/geolite2-city-ipv4.csv');
    const csv = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(csv, { columns: true });
    const recordsWithIpPrefix = records.map((record) => {
        return {
            ...record,
            ip_prefix: getFirst3PartsOfIp(record.ip_range_start),
        };
    });
    const recordsWithIpPrefixAndGeoIpFields = recordsWithIpPrefix.map((record) => {
        const geoIpFields = getGeoIpFields(record);
        return {
            ...record,
            ...geoIpFields,
        };
    });
    createGeoIpTableIfNotExists();
    sql`
        INSERT INTO geo_ip (
            ip_prefix,
            country_code,
            state1,
            state2,
            city,
            postcode,
            latitude,
            longitude,
            timezone
        ) VALUES ${sql(
            recordsWithIpPrefixAndGeoIpFields,
            ...geoIpFields,
        )}
    `;
}

function getFirst3PartsOfIp(ip) {
    return ip.split('.').slice(0, 3).join('.');
}


app.get('/', (req, res) => {
  res.send('Hello World!')
})

function limitPropertySizeForObject(obj, limit) {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'string' && obj[key].length > limit) {
            newObj[key] = `${obj[key].substring(0, limit)}...`;
        } else {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}
function limitNumberOfPropertiesForObject(obj, limit) {
    const newObj = {};
    let count = 0;
    Object.keys(obj).forEach((key) => {
        if (count < limit) {
            newObj[key] = obj[key];
            count++;
        }
    });
    return newObj;
}

app.get('/api/request', (req, res) => {
    const record = limitPropertySizeForObject({       
        userAgent: req.headers['user-agent'],
        acceptLanguage: req.headers['accept-language'],
        timestamp: new Date(),
        ...limitNumberOfPropertiesForObject(req.query, 20),
    }, 100);
    console.log(req);
    res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})
